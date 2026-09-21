import unittest
import time
from pathlib import Path
from tempfile import TemporaryDirectory

from app import (
    _yt_dlp_downloader,
    create_app,
    resolve_bilibili_short_url,
    validate_bilibili_url,
)


class BilibiliUrlValidationTests(unittest.TestCase):
    def test_accepts_bilibili_video_and_share_short_link(self):
        self.assertEqual(
            validate_bilibili_url("https://www.bilibili.com/video/BV1xx411c7mD"),
            "https://www.bilibili.com/video/BV1xx411c7mD",
        )
        self.assertEqual(
            validate_bilibili_url("https://b23.tv/AbCd123"),
            "https://b23.tv/AbCd123",
        )

    def test_rejects_other_hosts_and_non_http_schemes(self):
        for value in (
            "https://example.com/video/BV1xx411c7mD",
            "https://bilibili.com.example.org/video/BV1xx411c7mD",
            "file:///C:/private/video.mp4",
            "javascript:alert(1)",
        ):
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate_bilibili_url(value)

    def test_mobile_host_is_canonicalized_for_the_bilibili_extractor(self):
        self.assertEqual(
            validate_bilibili_url("https://m.bilibili.com/video/BV1xx411c7mD"),
            "https://www.bilibili.com/video/BV1xx411c7mD",
        )

    def test_accepts_bangumi_episode_link_with_query(self):
        url = "https://www.bilibili.com/bangumi/play/ep810660?theme=movie&spm_id_from=333.337.0.0"
        self.assertEqual(validate_bilibili_url(url), url)


def fake_downloader(url, output_dir, progress):
    progress(45)
    output = Path(output_dir) / "result.mp4"
    output.write_bytes(url.encode("utf-8"))
    progress(100)
    return output


def wait_for_status(client, task_id, expected):
    deadline = time.monotonic() + 3
    while time.monotonic() < deadline:
        response = client.get(f"/api/status/{task_id}")
        if response.status_code == 200 and response.get_json()["status"] == expected:
            return response.get_json()
        time.sleep(0.01)
    raise AssertionError(f"task did not reach {expected}")


class DownloadApiTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = TemporaryDirectory()
        self.addCleanup(self.tempdir.cleanup)
        self.app = create_app(download_dir=self.tempdir.name, downloader=fake_downloader)
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def start(self, url="https://www.bilibili.com/video/BV1xx411c7mD"):
        return self.client.post("/api/download", json={"url": url})

    def test_valid_job_returns_its_own_completed_attachment(self):
        url = "https://www.bilibili.com/video/BV1xx411c7mD"
        response = self.start(url)
        self.assertEqual(response.status_code, 202)
        task_id = response.get_json()["task_id"]

        status = wait_for_status(self.client, task_id, "finished")
        self.assertEqual(status["progress"], 100)
        result = self.client.get(f"/downloads/{task_id}")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.get_data(), url.encode("utf-8"))
        result.close()

    def test_bangumi_episode_link_reaches_the_downloader(self):
        url = "https://www.bilibili.com/bangumi/play/ep810660?theme=movie"
        response = self.start(url)
        self.assertEqual(response.status_code, 202)
        task_id = response.get_json()["task_id"]
        wait_for_status(self.client, task_id, "finished")
        result = self.client.get(f"/downloads/{task_id}")
        self.assertEqual(result.get_data(), url.encode("utf-8"))
        result.close()


    def test_bangumi_extractor_is_enabled(self):
        from unittest.mock import patch

        with TemporaryDirectory() as tempdir, patch("yt_dlp.YoutubeDL") as youtube_dl:
            downloader = youtube_dl.return_value.__enter__.return_value
            downloader.download.side_effect = lambda _urls: (
                Path(tempdir) / "episode.mp4"
            ).write_bytes(b"video")

            _yt_dlp_downloader(
                "https://www.bilibili.com/bangumi/play/ep810660",
                Path(tempdir),
                lambda _progress: None,
            )

            allowed_extractors = youtube_dl.call_args.args[0]["allowed_extractors"]
            self.assertIn("BiliBiliBangumi", allowed_extractors)

    def test_invalid_url_is_rejected_before_downloader_runs(self):
        calls = []
        app = create_app(
            download_dir=self.tempdir.name,
            downloader=lambda *args: calls.append(args),
        )
        response = app.test_client().post(
            "/api/download", json={"url": "https://example.com/video"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(calls, [])

    def test_unknown_task_status_and_download_return_404(self):
        self.assertEqual(self.client.get("/api/status/not-a-task").status_code, 404)
        self.assertEqual(self.client.get("/downloads/not-a-task").status_code, 404)

    def test_concurrent_tasks_do_not_share_download_results(self):
        urls = [
            "https://www.bilibili.com/video/BV1xx411c7mD",
            "https://www.bilibili.com/video/BV1yy411c7mD",
        ]
        task_ids = []
        for url in urls:
            response = self.start(url)
            self.assertEqual(response.status_code, 202)
            task_ids.append(response.get_json()["task_id"])
        for task_id in task_ids:
            wait_for_status(self.client, task_id, "finished")
        actual = []
        for task_id in task_ids:
            response = self.client.get(f"/downloads/{task_id}")
            actual.append(response.get_data())
            response.close()
        self.assertEqual(actual, [url.encode("utf-8") for url in urls])

    def test_failure_does_not_expose_exception_details(self):
        def broken_downloader(url, output_dir, progress):
            raise RuntimeError("TRACEBACK_SENTINEL: private stack details")

        app = create_app(download_dir=self.tempdir.name, downloader=broken_downloader)
        client = app.test_client()
        response = client.post(
            "/api/download", json={"url": "https://www.bilibili.com/video/BV1xx411c7mD"}
        )
        task_id = response.get_json()["task_id"]
        status = wait_for_status(client, task_id, "error")
        self.assertNotIn("TRACEBACK_SENTINEL", status["error"])

    def test_ffmpeg_missing_error_points_to_install_guide(self):
        def missing_ffmpeg(url, output_dir, progress):
            raise RuntimeError(
                "You have requested merging of multiple formats but ffmpeg is not installed. "
                "Aborting due to --abort-on-error"
            )

        app = create_app(download_dir=self.tempdir.name, downloader=missing_ffmpeg)
        client = app.test_client()
        response = client.post(
            "/api/download", json={"url": "https://www.bilibili.com/video/BV1xx411c7mD"}
        )
        status = wait_for_status(client, response.get_json()["task_id"], "error")
        self.assertIn("FFmpeg", status["error"])
        self.assertIn("安装与配置说明", status["error"])

    def test_rejects_forged_host_and_untrusted_origin(self):
        forged_host = self.client.get("/api/status/not-a-task", headers={"Host": "attacker.example"})
        self.assertEqual(forged_host.status_code, 403)
        untrusted_origin = self.client.post(
            "/api/download",
            json={"url": "https://www.bilibili.com/video/BV1xx411c7mD"},
            headers={"Origin": "https://attacker.example"},
        )
        self.assertEqual(untrusted_origin.status_code, 403)

    def test_crafted_download_path_does_not_resolve_files(self):
        self.assertEqual(self.client.get("/downloads/..%2F..%2Fapp.py").status_code, 404)

    def test_short_link_redirect_must_end_at_a_bilibili_video(self):
        class Response:
            def __init__(self, target):
                self.target = target

            def geturl(self):
                return self.target

            def close(self):
                pass

        class Opener:
            def __init__(self, target):
                self.target = target

            def open(self, url, timeout):
                self.requested = url.full_url
                self.timeout = timeout
                return Response(self.target)

        safe_opener = Opener("https://www.bilibili.com/video/BV1xx411c7mD")
        result = resolve_bilibili_short_url("https://b23.tv/AbCd123", opener=safe_opener)
        self.assertEqual(result, "https://www.bilibili.com/video/BV1xx411c7mD")
        self.assertEqual(safe_opener.requested, "https://b23.tv/AbCd123")

        http_opener = Opener("https://www.bilibili.com/video/BV1xx411c7mD")
        resolve_bilibili_short_url("http://b23.tv/AbCd123", opener=http_opener)
        self.assertEqual(http_opener.requested, "https://b23.tv/AbCd123")

        unsafe_opener = Opener("http://127.0.0.1/private")
        with self.assertRaises(ValueError):
            resolve_bilibili_short_url("https://b23.tv/AbCd123", opener=unsafe_opener)

    def test_short_link_task_downloads_the_resolved_bilibili_url(self):
        resolved_url = "https://www.bilibili.com/video/BV1xx411c7mD"
        downloader_urls = []

        def capture_download(url, output_dir, progress):
            downloader_urls.append(url)
            return fake_downloader(url, output_dir, progress)

        app = create_app(
            download_dir=self.tempdir.name,
            downloader=capture_download,
            short_link_resolver=lambda short_url: resolved_url,
        )
        client = app.test_client()
        response = client.post("/api/download", json={"url": "https://b23.tv/AbCd123"})
        task_id = response.get_json()["task_id"]
        wait_for_status(client, task_id, "finished")
        self.assertEqual(downloader_urls, [resolved_url])

    def test_homepage_has_download_form_and_status_controls(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        page = response.get_data(as_text=True)
        for content in (
            "哔哩哔哩视频下载",
            'rel="icon" href="data:,"',
            'id="downloadForm"',
            'id="videoUrl"',
            'id="clearUrlButton"',
            'aria-label="清空链接"',
            'id="submitButton"',
            'id="statusMessage"',
            'id="progressTrack"',
            'id="progressBar"',
            'id="resultLink"',
        ):
            with self.subTest(content=content):
                self.assertIn(content, page)

    def test_homepage_keeps_first_viewport_free_of_unrequested_subtitle(self):
        page = self.client.get("/").get_data(as_text=True)
        self.assertNotIn("粘贴 B 站视频链接，解析后下载到本机", page)
        self.assertIn('id="statusMessage" data-state="idle"></p>', page)

    def test_favicon_request_does_not_create_a_missing_resource_error(self):
        self.assertEqual(self.client.get("/favicon.ico").status_code, 204)


class LocalToolDocumentationTests(unittest.TestCase):
    def test_readme_explains_local_setup_and_authorized_use(self):
        root = Path(__file__).resolve().parents[1]
        readme = (root / "README.md").read_text(encoding="utf-8")
        self.assertIn("FFmpeg", readme)
        self.assertIn("http://127.0.0.1:5000", readme)
        self.assertIn("有权保存", readme)

    def test_rejects_playlist_and_non_video_bilibili_pages(self):
        for value in (
            "https://www.bilibili.com/video/BV1xx411c7mD?p=2",
            "https://www.bilibili.com/medialist/detail/ml123",
            "https://www.bilibili.com/",
        ):
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate_bilibili_url(value)


if __name__ == "__main__":
    unittest.main()
