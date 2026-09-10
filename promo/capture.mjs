// Записывает НАСТОЯЩИЕ анимации мини-аппа как последовательности кадров,
// вместе с координатами тапов (для пальца в промо).
import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const PROJ = "/Users/grigory/Desktop/для лизы";
const OUT = path.join(process.cwd(), "clips");
const PORT = 8811;
const FPS = 30;
const DSF = 1.35;                 // 400x866 * 1.35 = 540x1169
const NAME = "Аня";               // нейтральное имя для демо

const { PAGE } = await import(path.join(PROJ, "lib/page.mjs"));

const srv = http.createServer((q, s) => {
  const p = q.url.split("?")[0];
  if (p === "/app" || p === "/") {
    let html = PAGE(`http://localhost:${PORT}`);
    html = html.replace('const NAME = "Лиза";', `const NAME = ${JSON.stringify(NAME)};`);
    s.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return s.end(html);
  }
  if (p.startsWith("/p/")) {
    const f = path.join(PROJ, "public", p);
    if (fs.existsSync(f)) { s.writeHead(200, { "content-type": "image/jpeg" }); return s.end(fs.readFileSync(f)); }
  }
  s.writeHead(200); s.end("ok");
});
await new Promise((r) => srv.listen(PORT, r));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--font-render-hinting=none", "--disable-lcd-text",
         "--enable-gpu-rasterization", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: 400, height: 866, deviceScaleFactor: DSF });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function record(name, durMs, prep, act) {
  await page.goto(`http://localhost:${PORT}/app`, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))));
    await document.fonts.ready;
  });
  if (prep) { await page.evaluate(prep); await sleep(1100); }

  const dir = path.join(OUT, name);
  fs.mkdirSync(dir, { recursive: true });

  const cdp = await page.createCDPSession();
  const raw = [];
  let t0 = null;
  cdp.on("Page.screencastFrame", async (ev) => {
    const ts = ev.metadata.timestamp;
    if (t0 === null) t0 = ts;
    raw.push({ t: ts - t0, buf: Buffer.from(ev.data, "base64") });
    try { await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }); } catch {}
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg", quality: 92,
    maxWidth: Math.round(400 * DSF), maxHeight: Math.round(866 * DSF),
    everyNthFrame: 1,
  });

  const started = Date.now();
  const touches = act ? await act(page, started) : [];
  const left = durMs - (Date.now() - started);
  if (left > 0) await sleep(left);
  await cdp.send("Page.stopScreencast");
  await cdp.detach();

  // ресемпл в ровные 30 fps
  const n = Math.round((durMs / 1000) * FPS);
  let written = 0;
  for (let k = 0; k < n; k++) {
    const want = k / FPS;
    let pick = raw[0];
    for (const f of raw) { if (f.t <= want + 0.001) pick = f; else break; }
    if (!pick) pick = raw[raw.length - 1];
    if (!pick) break;
    fs.writeFileSync(path.join(dir, String(k).padStart(4, "0") + ".jpg"), pick.buf);
    written++;
  }
  console.log(`✓ ${name}: ${written} кадров (записано ${raw.length} сырых, ~${(raw.length / (durMs / 1000)).toFixed(0)} fps)`);
  return { name, frames: written, touches };
}

/* центры элементов в координатах итогового кадра */
async function centers(sel) {
  return await page.evaluate((s, k) => [...document.querySelectorAll(s)].map((e) => {
    const r = e.getBoundingClientRect();
    return { x: Math.round((r.left + r.width / 2) * k), y: Math.round((r.top + r.height / 2) * k) };
  }), sel, DSF);
}

const clips = [];

/* 1. фитиль — палец держит, кольцо заполняется */
clips.push(await record("wick", 2200, null, async (p, t0) => {
  const c = (await centers("#igw"))[0];
  await sleep(320);
  await p.mouse.move(c.x / DSF, c.y / DSF);
  await p.mouse.down();
  const touches = [{ t: (Date.now() - t0) / 1000, x: c.x, y: c.y, kind: "hold", dur: 1.15 }];
  await sleep(1150);
  await p.mouse.up();
  return touches;
}));

/* 2. имя */
clips.push(await record("name", 1500, () => { go(1); }, async () => []));

/* 3. свечи — три тапа */
clips.push(await record("candles", 2300, () => { go(2); }, async (p, t0) => {
  const cs = await centers(".candle");
  const touches = [];
  for (let i = 0; i < 3; i++) {
    await sleep(i === 0 ? 380 : 560);
    touches.push({ t: (Date.now() - t0) / 1000, x: cs[i].x, y: cs[i].y, kind: "tap" });
    await p.mouse.click(cs[i].x / DSF, cs[i].y / DSF);
  }
  return touches;
}));

/* 4. пожелания — тапы по пунктам */
clips.push(await record("wishes", 2000, () => { go(3); }, async (p, t0) => {
  const its = await centers("#wRow .qItem");
  const touches = [];
  for (let i = 0; i < its.length; i++) {
    await sleep(i === 0 ? 300 : 290);
    touches.push({ t: (Date.now() - t0) / 1000, x: its[i].x, y: its[i].y, kind: "tap" });
    await p.mouse.click(its[i].x / DSF, its[i].y / DSF);
  }
  return touches;
}));

/* 5. плёнка — свайпы по фото */
clips.push(await record("photos", 2400, () => { go(4); }, async (p, t0) => {
  const d = (await centers("#deck"))[0];
  const touches = [];
  for (let i = 0; i < 4; i++) {
    await sleep(i === 0 ? 340 : 500);
    touches.push({ t: (Date.now() - t0) / 1000, x: d.x + (i % 2 ? 60 : -60), y: d.y + (i % 2 ? -40 : 50), kind: "tap" });
    await p.mouse.click(d.x / DSF, d.y / DSF);
  }
  return touches;
}));

/* 6. финал — сердце рисуется, конфетти */
clips.push(await record("final", 2600, () => { go(5); }, async () => []));

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({
  fps: FPS, w: Math.round(400 * DSF), h: Math.round(866 * DSF), clips,
}, null, 2));

await browser.close();
srv.close();
console.log("\nманифест:", path.join(OUT, "manifest.json"));
