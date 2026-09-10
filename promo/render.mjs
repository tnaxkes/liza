import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const DIR = process.cwd();
const FRAMES = path.join(DIR, "frames");
const FPS = 30;
const PORT = 8822;

const MIME = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg" };
const srv = http.createServer((q, s) => {
  const p = decodeURIComponent(q.url.split("?")[0]);
  const f = path.join(DIR, p === "/" ? "promo.html" : p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    s.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
    return s.end(fs.readFileSync(f));
  }
  s.writeHead(404); s.end("no");
});
await new Promise((r) => srv.listen(PORT, r));

fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--font-render-hinting=none", "--disable-lcd-text"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/promo.html`, { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))));
  await document.fonts.ready;
});
await page.evaluate(() => window.__ready);

const DUR = await page.evaluate(() => window.DUR);
const total = Math.round(DUR * FPS);
console.log(`рендер ${total} кадров (${DUR}s @ ${FPS}fps)`);

for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.seekAsync(t), f / FPS);
  await page.screenshot({
    path: path.join(FRAMES, String(f).padStart(5, "0") + ".jpg"),
    type: "jpeg", quality: 94, optimizeForSpeed: true,
  });
  if (f % 60 === 0) console.log(`  ${f}/${total}`);
}

await browser.close();
srv.close();
console.log("кадры готовы");
