// Снимает кадры реального мини-аппа для промо-ролика.
// Фото размываются, имя заменяется на нейтральное.
import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const PROJ = "/Users/grigory/Desktop/для лизы";
const OUT = path.join(process.cwd(), "shots");
const PORT = 8811;
const { PAGE } = await import(path.join(PROJ, "lib/page.mjs"));

const srv = http.createServer((q, s) => {
  const p = q.url.split("?")[0];
  if (p === "/app" || p === "/") {
    s.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return s.end(PAGE(`http://localhost:${PORT}`));
  }
  if (p.startsWith("/p/")) {
    const f = path.join(PROJ, "public", p);
    if (fs.existsSync(f)) { s.writeHead(200, { "content-type": "image/jpeg" }); return s.end(fs.readFileSync(f)); }
  }
  s.writeHead(200); s.end("ok");
});
await new Promise((r) => srv.listen(PORT, r));

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--force-device-scale-factor=3", "--hide-scrollbars", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 400, height: 866, deviceScaleFactor: 3 });

const MASK = `
  .pl img{filter:blur(17px) saturate(1.25) contrast(1.05)}
  .pl .cap{color:#8a7278}
`;

async function shot(name, prep, wait = 1400) {
  await page.goto(`http://localhost:${PORT}/app`, { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: MASK });
  await page.evaluate(prep);
  await new Promise((r) => setTimeout(r, wait));
  await page.screenshot({ path: path.join(OUT, name + ".png") });
  console.log("✓", name);
}

await shot("s0_wick", () => {
  const c = document.querySelector("#igw circle");
  c.style.strokeDashoffset = 508 * (1 - 0.62);
}, 900);

await shot("s1_name", () => {
  go(1);
  setTimeout(() => {
    const el = document.getElementById("nameT");
    el.innerHTML = "";
    [..."Аня"].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "ch"; s.style.animation = "none"; s.style.opacity = "1"; s.style.transform = "none";
      s.textContent = ch; el.appendChild(s);
    });
  }, 300);
});

await shot("s2_candles", () => { go(2); });

await shot("s2b_blown", () => {
  go(2);
  setTimeout(() => {
    const cs = document.querySelectorAll(".candle");
    cs[0].click(); cs[2].click();
  }, 500);
});

await shot("s3_wishes", () => {
  go(3);
  setTimeout(() => {
    const it = document.querySelectorAll("#wRow .qItem");
    it[0].click(); it[1].click(); it[2].click();
  }, 500);
});

await shot("s4_photos", () => {
  go(4);
  setTimeout(() => { document.getElementById("deck").click(); }, 700);
}, 2200);

await shot("s5_final", () => { go(5); }, 3200);

await browser.close();
srv.close();
console.log("готово");
