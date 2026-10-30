// Prosty serwer plików statycznych do pracy lokalnej: node tools/serve.mjs [port]
// Moduły ES nie działają z file://, więc stronę trzeba otwierać przez http://.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TYPES = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json",
  ".svg":"image/svg+xml", ".png":"image/png", ".woff2":"font/woff2", ".xml":"application/xml", ".md":"text/markdown; charset=utf-8", ".txt":"text/plain; charset=utf-8" };

export function serve(port = 8000){
  const server = http.createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, path.endsWith("/") ? path + "index.html" : path);
    try { const body = await readFile(file); res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" }); res.end(body); }
    catch { res.writeHead(404); res.end("404"); }
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2]) || 8000;
  await serve(port);
  console.log(`http://localhost:${port}/`);
}
