# Bilibili Local Downloader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, local-only Flask webpage that downloads a single permitted Bilibili video with yt-dlp and serves the merged file back to the browser.

**Architecture:** A Flask app bound to loopback serves a single HTML page and JSON task/status endpoints. A small in-memory job manager runs yt-dlp in isolated per-task folders, reports progress, and returns only the final file belonging to that task. The page polls status and exposes the final file as a normal browser download.

**Tech Stack:** Python 3, Flask, yt-dlp, FFmpeg, HTML/CSS/vanilla JavaScript, Python `unittest`.

**Spec:** `docs/superpowers/specs/2026-09-20-bilibili-downloader-design.md`

## Global Constraints

- Flask page listens on `127.0.0.1` and is not exposed to a LAN or public network.
- Flask runs with `debug=False`.
- Accept only HTTP(S) Bilibili video URLs and `b23.tv` share short links; reject other sites and playlist/multi-P selection.
- Do not read, store, or request Cookies; do not attempt member, paid, region-restricted, or otherwise access-restricted content.
- Each download uses a UUID job directory and serves only that job's final output.
- Completed files remain in the app's `downloads/` directory until the user removes them.
- The initial version does not implement accounts, queues, batch/multi-P, subtitles/covers, remote deployment, or cross-device access.

## Review Focus

- Malformed, deceptive, non-HTTP, or non-Bilibili URLs must be rejected before yt-dlp runs — pin in Task 1 URL-validation tests.
- Bilibili short links and `p` query parameters must not accidentally enable playlist or multi-P downloads — pin in Task 1 short-link and page-selection tests.
- Concurrent jobs must not share progress, output folders, or downloadable files — pin in Task 2 job-isolation tests.
- Forged host/origin values, unknown task IDs, and crafted download paths must not expose the local service or arbitrary files — pin in Task 2 route-security tests.
- yt-dlp/FFmpeg/network failures must produce a bounded user-facing error without a debug traceback — pin in Task 2 failure tests and Task 3 UI behavior.

---

## File Structure

- Create `bilibili-downloader/app.py` — Flask factory, URL validation, job manager, yt-dlp adapter, local-only API, and safe file response.
- Create `bilibili-downloader/templates/index.html` — single-page responsive UI and browser polling/download behavior.
- Create `bilibili-downloader/requirements.txt` — Flask and yt-dlp runtime dependencies.
- Create `bilibili-downloader/run.bat` — Windows bootstrap/run helper using a project-local virtual environment.
- Create `bilibili-downloader/README.md` — prerequisites, startup, usage, limitations, and cleanup instructions.
- Create `bilibili-downloader/tests/test_app.py` — deterministic unit/API tests using a fake downloader; never fetch real media in automated tests.
- Runtime-only `bilibili-downloader/downloads/` — created by the app; not committed.

## Task 1: URL validation and test foundation

**Files:**
- Create: `bilibili-downloader/tests/test_app.py`
- Create: `bilibili-downloader/app.py`
- Create: `bilibili-downloader/requirements.txt`

**Interfaces:**
- Produces `validate_bilibili_url(raw_url: str) -> str`.
- Produces `create_app(download_dir=None, downloader=None) -> Flask`; `downloader` is optional and will be defined in Task 2 as `Callable[[str, Path, Callable[[float], None]], Path]`.

- [ ] **Step 1: Write failing URL validation tests**

```python
import unittest

from app import validate_bilibili_url


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
```

- [ ] **Step 2: Run tests and confirm expected failure**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: FAIL because `app.py` and `validate_bilibili_url` do not exist yet.

- [ ] **Step 3: Implement the validator and app factory skeleton**

Implement URL parsing with `urllib.parse.urlsplit`; allow only exact hosts `bilibili.com`, `www.bilibili.com`, `m.bilibili.com`, and `b23.tv`; require `http` or `https`; require a `/video/BV...` or `/video/av...` path for Bilibili hosts; allow a non-empty short path for `b23.tv`; reject a `p` query value other than `1`; normalize surrounding whitespace and return the accepted URL. Add an importable `create_app` factory and create `requirements.txt` with Flask and yt-dlp only.

- [ ] **Step 4: Run URL tests to verify they pass**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: all three URL-validation tests PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add bilibili-downloader/app.py bilibili-downloader/requirements.txt bilibili-downloader/tests/test_app.py
git commit -m "feat: scaffold local Bilibili downloader"
```

## Task 2: Isolated download jobs and safe Flask endpoints

**Files:**
- Modify: `bilibili-downloader/app.py`
- Modify: `bilibili-downloader/tests/test_app.py`

**Interfaces:**
- Consumes `validate_bilibili_url(raw_url: str) -> str` from Task 1.
- Produces `create_app(download_dir: Path | str | None = None, downloader: Callable[[str, Path, Callable[[float], None]], Path] | None = None) -> Flask`.
- `POST /api/download` returns `{"task_id": "..."}` with HTTP 202.
- `GET /api/status/<task_id>` returns `{"status": "pending|downloading|finished|error", "progress": 0..100, "error": "..."}`.
- `GET /downloads/<task_id>` returns that task's final file as an attachment, or 404 unless the task is finished.

- [ ] **Step 1: Add failing API/job tests with an injected fake downloader**

Extend `test_app.py` with this deterministic fake and bounded wait helper:

```python
import time
from pathlib import Path


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
        if response.get_json()["status"] == expected:
            return response.get_json()
        time.sleep(0.01)
    raise AssertionError(f"task did not reach {expected}")
```

In `setUp`, create a `TemporaryDirectory`, a Flask app with `create_app(download_dir=tempdir, downloader=fake_downloader)`, enable `TESTING`, and keep its test client. Test that valid POST returns 202 and a task ID; wait for `finished`; assert progress is 100; GET `/downloads/<task_id>` and assert the body is that URL's bytes. Assert invalid URL returns 400 and does not call the fake. Assert unknown status/download task IDs return 404. Submit two distinct valid URLs and verify their file responses contain their own respective URL bytes. Add a fake that raises an exception containing a sentinel traceback string and assert the returned state is `error` without exposing that sentinel.

- [ ] **Step 2: Run tests and confirm expected failure**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: the new endpoint tests FAIL because the routes and job manager are missing.

- [ ] **Step 3: Implement a locked in-memory job manager and yt-dlp adapter**

Implement a `DownloadManager` whose `start(url)` allocates a UUID, creates a unique task directory, stores a `pending` record, and starts one daemon thread for that task. Store task state behind `threading.Lock`; update progress through a callback. The default downloader configures yt-dlp with `noplaylist=True`, best available video plus audio with a combined-format fallback, MP4 merge output, and a progress hook. Run yt-dlp with only the Bilibili extractor allowed. Since each job has a private directory and one-video-only mode, identify the finished media only from that directory; fail unless exactly one final non-temporary media file exists. Keep errors short and remove terminal escape sequences before returning them. Implement `create_app` injection as `create_app(download_dir=None, downloader=None)`, defaulting to the real yt-dlp adapter while tests supply the callable above.

Implement `create_app` with same-origin page serving, the three interfaces above, strict URL validation before job creation, task-ID lookup, and `send_file` on the manager-owned path only. Restrict accepted Host/Origin values to local app origins, return 404 for unknown IDs, use `debug=False`, and bind `127.0.0.1` in the run entry point. Add route tests that send `Host: attacker.example` and an untrusted `Origin` and assert 403; verify the app factory's normal local test-client requests succeed.

- [ ] **Step 4: Run all tests and verify concurrency/error cases**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: PASS, including independent output for two jobs, task failure state, and no file response for unfinished/unknown jobs.

- [ ] **Step 5: Commit Task 2**

```bash
git add bilibili-downloader/app.py bilibili-downloader/tests/test_app.py
git commit -m "feat: add isolated local download jobs"
```

## Task 3: Responsive webpage and download interaction

**Files:**
- Create: `bilibili-downloader/templates/index.html`
- Modify: `bilibili-downloader/tests/test_app.py`

**Interfaces:**
- Consumes the three Flask endpoints from Task 2.
- Uses DOM IDs `downloadForm`, `videoUrl`, `submitButton`, `statusMessage`, `progressTrack`, `progressBar`, and `resultLink`.

- [ ] **Step 1: Add failing page/API rendering test**

Test `GET /` returns 200, includes the title `哔哩哔哩视频下载`, and includes the form, URL input, submit button, progress region, and result link IDs listed above.

- [ ] **Step 2: Run tests and confirm the page test fails**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: FAIL because the template does not exist.

- [ ] **Step 3: Build the single-page UI and polling flow**

Create the template with the supplied reference's dark surface, subtle patterned background, large centered heading, full-width URL field, paste affordance, and blue download action. On submit, validate non-empty input client-side, disable duplicate submission, POST to `/api/download`, then poll `/api/status/<task_id>` once per second. Show status and percentage progress, stop polling on `finished` or `error`, expose `/downloads/<task_id>` on success, and show a readable error while re-enabling the form on failure. Add accessible labels, keyboard focus styles, mobile stacking, and `aria-live` status announcements. Do not display fake media metadata or a success state before the server confirms it.

- [ ] **Step 4: Run tests and manually inspect UI states**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: PASS for route and template checks. Start the real local app and verify the idle page and invalid-link error in a browser; API tests already verify pending/progress/success/failure deterministically.

- [ ] **Step 5: Commit Task 3**

```bash
git add bilibili-downloader/templates/index.html bilibili-downloader/tests/test_app.py
git commit -m "feat: add local Bilibili downloader page"
```

## Task 4: Windows startup, usage documentation, and end-to-end handoff

**Files:**
- Create: `bilibili-downloader/run.bat`
- Create: `bilibili-downloader/README.md`
- Modify: `bilibili-downloader/tests/test_app.py` only if a documented startup/configuration behavior needs an automated assertion.

**Interfaces:**
- `run.bat` creates/reuses `.venv`, installs `requirements.txt` when needed, checks that `ffmpeg` is available, starts `app.py`, and leaves the console visible for logs.
- README lists Windows prerequisites, `run.bat`, manual Python commands, `http://127.0.0.1:5000`, usage, limitations, output location, and how to stop the service.

- [ ] **Step 1: Add failing documentation/startup checks before implementation**

Add this test to `test_app.py`:

```python
from pathlib import Path
import unittest


class LocalToolDocumentationTests(unittest.TestCase):
    def test_readme_explains_local_setup_and_authorized_use(self):
        root = Path(__file__).resolve().parents[1]
        readme = (root / "README.md").read_text(encoding="utf-8")
        self.assertIn("FFmpeg", readme)
        self.assertIn("http://127.0.0.1:5000", readme)
        self.assertIn("有权保存", readme)
```

The actual test directory is `bilibili-downloader/tests`, so `parents[1]` resolves to the local tool root.

- [ ] **Step 2: Run the documentation test and confirm it fails**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: FAIL because README and run helper do not exist yet.

- [ ] **Step 3: Add the startup helper and concise README**

Implement `run.bat` to `cd` to its own folder, verify the Python launcher exists, create `.venv` if absent, install `requirements.txt`, check `ffmpeg -version`, stop with an actionable message if missing, and finally run `.venv\Scripts\python app.py`. Document that the service is local-only and has no homepage entry, no API fee is used, network traffic still applies, quality/access depend on Bilibili and yt-dlp, and the tool does not handle login/member restrictions.

- [ ] **Step 4: Run full tests and local smoke test**

Run: `python -m unittest discover -s bilibili-downloader/tests -v`
Expected: all tests PASS. Start the app and verify `GET /`, invalid-link rejection, fake-download completion, and the final attachment response. If a real public video the user is authorized to save is available and platform/network access permits, run one end-to-end download; otherwise report that real Bilibili extraction remains unverified.

- [ ] **Step 5: Commit Task 4**

```bash
git add bilibili-downloader/run.bat bilibili-downloader/README.md bilibili-downloader/tests/test_app.py
git commit -m "docs: add local downloader setup guide"
```
