"""Local development server for the portfolio's clean URLs."""

from __future__ import annotations

import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "5001"))

PAGE_ROUTES = {
    "/": ROOT / "alpha.html",
    "/work": ROOT / "work.html",
}

FILE_ROUTES = {
    "/alpha.css": ROOT / "alpha.css",
    "/alpha.js": ROOT / "alpha.js",
    "/favicon-96.png": ROOT / "favicon-96.png",
}

REDIRECTS = {
    "/alpha.html": "/",
    "/work.html": "/work",
    "/work/": "/work",
}


class PortfolioHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        path = unquote(urlsplit(self.path).path)

        if path in REDIRECTS:
            self.send_response(308)
            self.send_header("Location", REDIRECTS[path])
            self.end_headers()
            return

        file_path = PAGE_ROUTES.get(path) or FILE_ROUTES.get(path)

        if file_path is None and path.startswith("/assets/"):
            candidate = (ROOT / path.lstrip("/")).resolve()
            if candidate == ASSETS or ASSETS in candidate.parents:
                file_path = candidate

        if file_path is None or not file_path.is_file():
            self.send_error(404, "Page not found")
            return

        content_type, _ = mimetypes.guess_type(file_path.name)
        payload = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    url = f"http://{HOST}:{PORT}"
    print(f"Portfolio running at {url}")
    print(f"Work page: {url}/work")
    ThreadingHTTPServer((HOST, PORT), PortfolioHandler).serve_forever()
