"""Local-only Bilibili video downloader web application."""

from __future__ import annotations

import re
import threading
import uuid
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from flask import Flask, abort, jsonify, request, send_file


_BILIBILI_HOSTS = {"bilibili.com", "www.bilibili.com", "m.bilibili.com"}
_VIDEO_PATH = re.compile(r"^/video/(?:BV[0-9A-Za-z]{10}|av[0-9]+)/?$", re.IGNORECASE)
_BANGUMI_EP_PATH = re.compile(r"^/bangumi/play/ep[0-9]+/?$", re.IGNORECASE)
_SHORT_LINK_HOSTS = _BILIBILI_HOSTS | {"b23.tv"}


def validate_bilibili_url(raw_url: str) -> str:
    """Return a normalized supported Bilibili video URL or raise ValueError."""
    if not isinstance(raw_url, str):
        raise ValueError("请输入 B 站视频链接。")

    value = raw_url.strip()
    if not value or len(value) > 2048:
        raise ValueError("请输入有效的 B 站视频链接。")

    try:
        parsed = urlsplit(value)
        hostname = (parsed.hostname or "").lower().rstrip(".")
        # Accessing .port validates malformed port syntax as well.
        port = parsed.port
    except ValueError as exc:
        raise ValueError("链接格式无效。") from exc

    if parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError("仅支持 HTTP 或 HTTPS 链接。")
    if parsed.username is not None or parsed.password is not None or port is not None:
        raise ValueError("链接格式无效。")
    if parsed.fragment:
        raise ValueError("链接格式无效。")
    if hostname not in _BILIBILI_HOSTS and hostname != "b23.tv":
        raise ValueError("目前仅支持 Bilibili 视频链接。")

    query = parse_qs(parsed.query, keep_blank_values=True)
    if any(page != ["1"] for page in query.get("p", [])):
        raise ValueError("暂不支持合集或分 P 链接，请粘贴单个视频链接。")

    if hostname == "b23.tv":
        if parsed.path in {"", "/"} or parsed.path.count("/") != 1:
            raise ValueError("短链接格式无效。")
    elif not (
        _VIDEO_PATH.fullmatch(parsed.path)
        or _BANGUMI_EP_PATH.fullmatch(parsed.path)
    ):
        raise ValueError("请粘贴 B 站单个视频或番剧集数页面链接。")

    if hostname == "m.bilibili.com":
        return urlunsplit((parsed.scheme, "www.bilibili.com", parsed.path, parsed.query, ""))
    return value


class _BilibiliRedirectHandler(HTTPRedirectHandler):
    """Allow short-link redirects only to HTTPS Bilibili hosts."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        target = urlsplit(urljoin(req.full_url, newurl))
        try:
            port = target.port
        except ValueError as exc:
            raise ValueError("短链接跳转地址无效。") from exc
        if (
            target.scheme.lower() != "https"
            or (target.hostname or "").lower().rstrip(".") not in _SHORT_LINK_HOSTS
            or port is not None
            or target.username is not None
            or target.password is not None
        ):
            raise ValueError("短链接跳转到了非 B 站地址，已阻止。")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def resolve_bilibili_short_url(url: str, opener=None) -> str:
    """Resolve a b23.tv share link without following redirects off Bilibili."""
    parsed = urlsplit(validate_bilibili_url(url))
    if (parsed.hostname or "").lower() != "b23.tv":
        return url

    if opener is None:
        opener = build_opener(_BilibiliRedirectHandler())
    secure_url = urlunsplit(("https", "b23.tv", parsed.path, parsed.query, ""))
    request = Request(secure_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        response = opener.open(request, timeout=10)
        try:
            resolved = response.geturl()
        finally:
            response.close()
    except Exception as exc:
        raise ValueError("短链接解析失败，请检查链接和网络后重试。") from exc

    resolved = validate_bilibili_url(resolved)
    final_host = (urlsplit(resolved).hostname or "").lower().rstrip(".")
    if final_host not in _BILIBILI_HOSTS or not resolved.lower().startswith("https://"):
        raise ValueError("短链接没有指向 B 站视频页。")
    return resolved


@dataclass
class DownloadTask:
    task_id: str
    directory: Path
    url: str
    status: str = "pending"
    progress: int = 0
    output_path: Path | None = None
    error: str | None = None


def _yt_dlp_downloader(url: str, output_dir: Path, progress) -> Path:
    import yt_dlp

    output_template = str(output_dir / "%(id)s.%(ext)s")

    def on_progress(info):
        if info.get("status") != "downloading":
            return
        percent = info.get("_percent_str", "").replace("%", "").strip()
        try:
            value = float(percent)
        except ValueError:
            total = info.get("total_bytes") or info.get("total_bytes_estimate")
            value = info.get("downloaded_bytes", 0) / total * 100 if total else 0
        progress(max(0, min(99, round(value))))

    options = {
        "format": "bestvideo+bestaudio/best",
        "noplaylist": True,
        "merge_output_format": "mp4",
        "outtmpl": output_template,
        "progress_hooks": [on_progress],
        "allowed_extractors": ["BiliBili", "BiliBiliBangumi"],
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(options) as ydl:
        ydl.download([url])

    media_extensions = {".mp4", ".mkv", ".webm", ".mov", ".avi", ".flv"}
    outputs = [
        item for item in output_dir.iterdir()
        if item.is_file() and item.suffix.lower() in media_extensions and item.stat().st_size > 0
    ]
    if len(outputs) != 1:
        raise RuntimeError("Expected exactly one completed media file")
    return outputs[0]


class DownloadManager:
    def __init__(self, download_dir: Path, downloader, short_link_resolver):
        self.download_dir = download_dir.resolve()
        self.download_dir.mkdir(parents=True, exist_ok=True)
        self.downloader = downloader
        self.short_link_resolver = short_link_resolver
        self.tasks: dict[str, DownloadTask] = {}
        self.lock = threading.Lock()

    def start(self, url: str) -> str:
        task_id = str(uuid.uuid4())
        task_dir = (self.download_dir / task_id).resolve()
        task_dir.mkdir(parents=True, exist_ok=False)
        task = DownloadTask(task_id=task_id, directory=task_dir, url=url, status="downloading")
        with self.lock:
            self.tasks[task_id] = task
        threading.Thread(target=self._run, args=(task,), daemon=True).start()
        return task_id

    def _run(self, task: DownloadTask) -> None:
        def update_progress(value: float) -> None:
            with self.lock:
                task.progress = max(0, min(99, int(value)))

        try:
            source_url = task.url
            if (urlsplit(source_url).hostname or "").lower() == "b23.tv":
                source_url = self.short_link_resolver(source_url)
            output = Path(self.downloader(source_url, task.directory, update_progress)).resolve()
            if not output.is_relative_to(task.directory) or not output.is_file():
                raise RuntimeError("Downloader returned an invalid output path")
            with self.lock:
                task.output_path = output
                task.progress = 100
                task.status = "finished"
        except Exception as exc:
            with self.lock:
                task.status = "error"
                error_text = str(exc).lower()
                if "ffmpeg" in error_text and any(
                    marker in error_text
                    for marker in ("not installed", "not found", "could not find", "unable to locate")
                ):
                    task.error = "未检测到 FFmpeg，请重新运行安装器准备 FFmpeg 后重试。"
                else:
                    task.error = "下载失败。请检查视频是否可公开访问、网络连接及 FFmpeg 安装。"

    def status(self, task_id: str) -> dict | None:
        with self.lock:
            task = self.tasks.get(task_id)
            if task is None:
                return None
            return {
                "status": task.status,
                "progress": task.progress,
                **({"error": task.error} if task.error else {}),
            }

    def output(self, task_id: str) -> Path | None:
        with self.lock:
            task = self.tasks.get(task_id)
            return task.output_path if task and task.status == "finished" else None


def create_app(download_dir=None, downloader=None, short_link_resolver=None) -> Flask:
    """Create a loopback-only Flask application with isolated download jobs."""
    app = Flask(__name__)
    app.config.update(DEBUG=False, TESTING=False)
    root = Path(download_dir) if download_dir is not None else Path(__file__).parent / "downloads"
    manager = DownloadManager(
        root,
        downloader or _yt_dlp_downloader,
        short_link_resolver or resolve_bilibili_short_url,
    )
    app.extensions["download_manager"] = manager

    def is_loopback_host(value: str) -> bool:
        try:
            parsed = urlsplit(f"//{value}")
            return (
                parsed.hostname in {"localhost", "127.0.0.1"}
                and parsed.username is None
                and parsed.password is None
                and parsed.port in {None, 5000}
            )
        except ValueError:
            return False

    @app.before_request
    def require_local_request():
        if not is_loopback_host(request.host):
            abort(403)
        origin = request.headers.get("Origin")
        if origin:
            parsed = urlsplit(origin)
            if parsed.scheme != "http" or not is_loopback_host(parsed.netloc):
                abort(403)

    @app.get("/")
    def index():
        from flask import render_template

        return render_template("index.html")

    @app.post("/api/download")
    def start_download():
        payload = request.get_json(silent=True)
        url = payload.get("url") if isinstance(payload, dict) else None
        try:
            valid_url = validate_bilibili_url(url)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        task_id = manager.start(valid_url)
        # Keep the URL outside the public task record while the worker needs it.
        return jsonify({"task_id": task_id}), 202

    @app.get("/api/status/<task_id>")
    def task_status(task_id):
        result = manager.status(task_id)
        if result is None:
            abort(404)
        return jsonify(result)

    @app.get("/downloads/<task_id>")
    def download_result(task_id):
        output = manager.output(task_id)
        if output is None:
            abort(404)
        return send_file(output, as_attachment=True, download_name=output.name)

    @app.get("/favicon.ico")
    def favicon():
        return "", 204

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=5000, debug=False)
