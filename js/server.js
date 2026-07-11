"use strict";
/* ============================================================================
   HYPER OLYMPIC — Server entry point.
   ============================================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const HOST = "0.0.0.0";

const MIME = {
  ".html":"text/html",
  ".js":"application/javascript",
  ".css":"text/css",
  ".json":"application/json",
  ".png":"image/png",
  ".svg":"image/svg+xml",
  ".woff":"font/woff",
  ".woff2":"font/woff2",
  ".ttf":"font/ttf",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`HyperOlympic server running at http://${HOST}:${PORT}`);
});
