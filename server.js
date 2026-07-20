/**
 * Minimal zero-dependency static file server for Railway / any host.
 *
 * Railway injects a PORT env var and expects the app to listen on it and on
 * host 0.0.0.0 — this serves the static landing page exactly that way.
 * No npm dependencies, so there is nothing to install or break.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const ROOT = __dirname;
// Guestbook entries live in a JSON file. Point DATA_DIR at a mounted
// volume on Railway so entries survive redeploys.
const GB_FILE = path.join(process.env.DATA_DIR || __dirname, "guestbook.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  // Strip query string and decode, then resolve safely inside ROOT.
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  if (urlPath === "/guestbook") {
    if (req.method === "GET") {
      return fs.readFile(GB_FILE, (err, data) => {
        res.writeHead(200, { "Content-Type": MIME[".json"], "Cache-Control": "no-cache" });
        res.end(err ? "[]" : data);
      });
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", (c) => { body += c; if (body.length > 4096) req.destroy(); });
      req.on("end", () => {
        let entry;
        try { entry = JSON.parse(body); } catch (e) {
          res.writeHead(400); return res.end("bad json");
        }
        const name = String(entry.name || "anon").slice(0, 24);
        const msg = String(entry.msg || "…").slice(0, 120);
        const t = new Date().toISOString().slice(0, 10);
        fs.readFile(GB_FILE, (err, data) => {
          let list = [];
          if (!err) { try { list = JSON.parse(data); } catch (e) {} }
          list.unshift({ name, msg, t });
          list = list.slice(0, 500);
          fs.writeFile(GB_FILE, JSON.stringify(list), (werr) => {
            if (werr) { res.writeHead(500); return res.end("write failed"); }
            res.writeHead(200, { "Content-Type": MIME[".json"] });
            res.end(JSON.stringify(list));
          });
        });
      });
      return;
    }
    res.writeHead(405);
    return res.end("method not allowed");
  }
  let filePath = path.join(ROOT, urlPath);

  // Prevent path traversal outside the project root.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        // Fall back to the SPA entry point so deep links still work.
        return fs.readFile(path.join(ROOT, "index.html"), (fallbackErr, html) => {
          if (fallbackErr) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("404 Not Found");
          }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(html);
        });
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      // Cache static assets, but always revalidate the HTML entry point.
      const cache = ext === ".html" ? "no-cache" : "public, max-age=3600";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": cache });
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`$DICK landing page live on http://${HOST}:${PORT}`);
});
