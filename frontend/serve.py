#!/usr/bin/env python3
"""Serve MedGraph UI and proxy /walker/* to Jac API (avoids CORS)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
import urllib.request

_jac_port = os.environ.get("MEDGRAPH_JAC_PORT", "8000")
JAC_API = f"http://127.0.0.1:{_jac_port}"


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json") or path.startswith("/swagger"):
            url = f"{JAC_API}{self.path}"
            try:
                with urllib.request.urlopen(url, timeout=60) as resp:
                    data = resp.read()
                    self.send_response(resp.status)
                    ct = resp.headers.get("Content-Type", "application/octet-stream")
                    self.send_header("Content-Type", ct)
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.send_header("Content-Type", "text/plain")
                self.end_headers()
                self.wfile.write(f"Proxy error: {e}".encode())
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.startswith("/walker/"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length) if length else b"{}"
            url = f"{JAC_API}{self.path}"
            req = urllib.request.Request(
                url,
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=120) as resp:
                    data = resp.read()
                    self.send_response(resp.status)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode())
            return
        super().do_POST()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def wait_for_jac(timeout: float = 45.0) -> None:
    import time
    import urllib.error

    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            req = urllib.request.Request(
                f"{JAC_API}/walker/health",
                data=b"{}",
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    print(f"Jac API ready at {JAC_API}")
                    return
        except Exception:
            time.sleep(0.75)
    print(f"WARNING: Jac not ready at {JAC_API} — start UI anyway; retry in browser")


if __name__ == "__main__":
    port = 5500
    wait_for_jac()
    print(f"MedGraph UI → http://127.0.0.1:{port}  (proxies walkers to {JAC_API})")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
