#!/usr/bin/env python3
import argparse
import http.server
import os
import queue
import socketserver
import threading
import time
from pathlib import Path


RELOAD_PATH = "/__reload/events"
RELOAD_SCRIPT = """
<script data-reload-server>
(() => {
  if (!("EventSource" in window)) {
    return;
  }
  const events = new EventSource("/__reload/events");
  events.addEventListener("reload", () => window.location.reload());
})();
</script>
"""


class ReloadHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
  daemon_threads = True
  allow_reuse_address = True

  def __init__(self, server_address, handler_class, root):
    super().__init__(server_address, handler_class)
    self.root = root.resolve()
    self.reload_clients = set()
    self.reload_clients_lock = threading.Lock()

  def notify_reload(self):
    with self.reload_clients_lock:
      clients = list(self.reload_clients)

    for client in clients:
      client.put(None)


class ReloadRequestHandler(http.server.SimpleHTTPRequestHandler):
  def do_GET(self):
    if self.path.startswith(RELOAD_PATH):
      self.handle_reload_events()
      return

    html_path = self.get_html_path()
    if html_path:
      self.serve_injected_html(html_path)
      return

    super().do_GET()

  def handle_reload_events(self):
    client = queue.Queue()
    with self.server.reload_clients_lock:
      self.server.reload_clients.add(client)

    self.send_response(200)
    self.send_header("Content-Type", "text/event-stream")
    self.send_header("Cache-Control", "no-cache")
    self.send_header("Connection", "keep-alive")
    self.end_headers()

    try:
      self.wfile.write(b": connected\n\n")
      self.wfile.flush()
      while True:
        try:
          client.get(timeout=15)
          self.wfile.write(b"event: reload\ndata: save\n\n")
        except queue.Empty:
          self.wfile.write(b": ping\n\n")
        self.wfile.flush()
    except (BrokenPipeError, ConnectionResetError):
      pass
    finally:
      with self.server.reload_clients_lock:
        self.server.reload_clients.discard(client)

  def get_html_path(self):
    requested_path = Path(self.translate_path(self.path))
    if requested_path.is_dir():
      requested_path = requested_path / "index.html"

    if requested_path.suffix.lower() != ".html" or not requested_path.is_file():
      return None

    resolved = requested_path.resolve()
    try:
      resolved.relative_to(self.server.root)
    except ValueError:
      return None

    return resolved

  def serve_injected_html(self, html_path):
    html = html_path.read_text(encoding="utf-8", errors="replace")
    if "data-reload-server" not in html:
      lower_html = html.lower()
      body_close = lower_html.rfind("</body>")
      if body_close == -1:
        html = html + RELOAD_SCRIPT
      else:
        html = html[:body_close] + RELOAD_SCRIPT + html[body_close:]

    payload = html.encode("utf-8")
    self.send_response(200)
    self.send_header("Content-Type", "text/html; charset=utf-8")
    self.send_header("Content-Length", str(len(payload)))
    self.send_header("Cache-Control", "no-cache")
    self.end_headers()
    self.wfile.write(payload)


def snapshot_files(root):
  ignored_dirs = {".git", "node_modules", "__pycache__"}
  ignored_files = {".DS_Store"}
  entries = []

  for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [name for name in dirnames if name not in ignored_dirs]
    for filename in filenames:
      if filename in ignored_files:
        continue

      path = Path(dirpath) / filename
      try:
        stat = path.stat()
      except OSError:
        continue

      entries.append((str(path.relative_to(root)), stat.st_mtime_ns, stat.st_size))

  return tuple(sorted(entries))


def watch_for_changes(server, interval):
  previous = snapshot_files(server.root)
  while True:
    time.sleep(interval)
    current = snapshot_files(server.root)
    if current != previous:
      previous = current
      print("Change detected. Reloading browsers.", flush=True)
      server.notify_reload()


def parse_args():
  parser = argparse.ArgumentParser(description="Serve this static site and reload browsers on save.")
  parser.add_argument("--host", default="127.0.0.1", help="Host to bind. Default: 127.0.0.1")
  parser.add_argument("--port", default=8000, type=int, help="Port to bind. Default: 8000")
  parser.add_argument("--root", default=".", help="Site root to serve. Default: current directory")
  parser.add_argument("--interval", default=0.5, type=float, help="Watch interval in seconds. Default: 0.5")
  return parser.parse_args()


def main():
  args = parse_args()
  root = Path(args.root).resolve()

  handler = lambda *handler_args, **handler_kwargs: ReloadRequestHandler(
    *handler_args,
    directory=str(root),
    **handler_kwargs
  )
  server = ReloadHTTPServer((args.host, args.port), handler, root)
  watcher = threading.Thread(target=watch_for_changes, args=(server, args.interval), daemon=True)
  watcher.start()

  print(f"Serving {root} at http://{args.host}:{args.port}", flush=True)
  print("Watching files. Save a file to reload connected browsers.", flush=True)
  try:
    server.serve_forever()
  except KeyboardInterrupt:
    print("\nStopping server.", flush=True)
  finally:
    server.server_close()


if __name__ == "__main__":
  main()
