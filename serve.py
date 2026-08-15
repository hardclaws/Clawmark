#!/usr/bin/env python3
"""
Local static server for the Shoutout Overlay.

Why this exists instead of `python -m http.server`:
  * Browsers cancel in-flight requests constantly (iframe reloads, video
    seeking). The stock server dumps a full ConnectionAbortedError /
    BrokenPipeError traceback every time. Those are harmless but look
    alarming. This subclass swallows them.
  * Serves a favicon so you don't get 404 noise.
  * Sends no-cache headers so edits show up on refresh.
  * Binds IPv4 explicitly (the stock server prefers ::1, which some
    Windows setups route oddly).

Usage:  python serve.py [port]
"""
import sys
import os
import socket
import socketserver
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.abspath(__file__))

# 1x1 transparent PNG, so /favicon.ico stops 404-ing
FAVICON = bytes.fromhex(
    "89504e470d0a1a0a0000000d494844520000000100000001080600000"
    "01f15c4890000000a49444154789c6300010000050001"
    "0d0a2db40000000049454e44ae426082"
)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # never cache during development
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] in ("/favicon.ico",):
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(FAVICON)))
            self.end_headers()
            try:
                self.wfile.write(FAVICON)
            except (ConnectionError, OSError):
                pass
            return
        super().do_GET()

    # ---- the important part: silence normal client disconnects ----
    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError,
                BrokenPipeError, OSError):
            pass  # browser navigated away mid-download; entirely normal

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionResetError, ConnectionAbortedError,
                BrokenPipeError, OSError):
            self.close_connection = True

    def log_message(self, fmt, *args):
        # keep request logs, drop the noisy favicon line
        if "favicon" in (args[0] if args else ""):
            return
        sys.stderr.write("  %s\n" % (fmt % args))

    def log_error(self, *args):
        pass  # aborted connections are not errors worth printing


class Server(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        """Stock implementation prints a traceback. Disconnects aren't errors."""
        exc = sys.exc_info()[1]
        if isinstance(exc, (ConnectionResetError, ConnectionAbortedError,
                            BrokenPipeError, OSError)):
            return
        super().handle_error(request, client_address)


def main():
    try:
        httpd = Server(("0.0.0.0", PORT), Handler)
    except OSError as e:
        print(f"\n  ERROR: could not bind port {PORT} — {e}")
        print(f"  Something else is probably using it. Try: python serve.py {PORT + 1}\n")
        sys.exit(1)

    print()
    print("  Shoutout Overlay running at:")
    print()
    print(f"     Builder      http://localhost:{PORT}/")
    print(f"     Diagnostics  http://localhost:{PORT}/test.html")
    print(f"     Get a token  http://localhost:{PORT}/token.html")
    print()
    print("  Press Ctrl+C to stop.")
    print()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.\n")
        httpd.server_close()


if __name__ == "__main__":
    main()
