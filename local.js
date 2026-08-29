#!/usr/bin/env node
// ============================================================
//  Локальный запуск. Чистый Node 18+, без npm-зависимостей.
//    node local.js
//  Long polling — вебхук настраивать не надо.
//  Мини-апп поднимается на localhost и прокидывается наружу
//  через cloudflared (Telegram требует https для Web App).
// ============================================================

import http from "http";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// токен берём из окружения или из файла .env (TELEGRAM_TOKEN=...)
try {
  const envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  for (const line of envFile.split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const TOKEN = process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
  console.error("нет TELEGRAM_TOKEN. создай файл .env со строкой:\n  TELEGRAM_TOKEN=сюда_токен_от_BotFather");
  process.exit(1);
}
const OWNER_ID = 952560202;
const PORT = Number(process.env.PORT || 8787);
const API = `https://api.telegram.org/bot${TOKEN}`;

// подтягиваем логику мини-аппа из worker.js
const workerSrc = fs.readFileSync(path.join(__dirname, "worker.js"), "utf8");
const PAGE = new Function(
  workerSrc.replace("export default", "const _unused =") + "\nreturn PAGE;"
)();
const PHOTOS = new Function(
  workerSrc.replace("export default", "const _unused =") + "\nreturn PHOTOS;"
)();

// ---------------- сценарий ----------------
const S = {
  start: `с днём рождения 🎂

это бот, но всё внутри — от текста до картинок — собирал я сам. решил, что простого сообщения в лс на твой день мало.`,

  s1: `там небольшая история в несколько экранов: свечи, наши фотки и пара слов для тебя.

это пара минут. листай спокойно, не торопись.`,

  s2: `и ещё раз, по-нормальному: с днём рождения. пусть этот год будет твоим — без лишнего.

готова?`,

  s3: `жми «открыть» внизу 👇

как дойдёшь до конца — там будет кое-что важное.`,

  nudge: `нажми кнопку под сообщением — оттуда всё и начнётся 👇`,

  finish: `ну всё, дальше не по телефону.

не собирайся долго, марафет не наводи — просто спустись вниз. подарок ждёт тебя у подъезда. 🎂`,
};

let PUBLIC_URL = process.env.PUBLIC_URL || null;

// ---------------- http сервер ----------------
http
  .createServer(async (req, res) => {
    const u = new URL(req.url, `http://localhost:${PORT}`);

    if (u.pathname === "/app") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(PAGE(PUBLIC_URL || `http://localhost:${PORT}`));
    }

    if (u.pathname.startsWith("/p/")) {
      const i = parseInt(u.pathname.slice(3), 10);
      if (PHOTOS[i] === undefined) { res.writeHead(404); return res.end("no"); }
      const buf = Buffer.from(PHOTOS[i], "base64");
      res.writeHead(200, { "content-type": "image/jpeg", "cache-control": "public,max-age=31536000" });
      return res.end(buf);
    }

    if (u.pathname === "/track" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      await new Promise((r) => req.on("end", r));
      let d = {};
      try { d = JSON.parse(body); } catch {}
      log(`шаг: ${d.name || "она"} — ${d.step}`);
      await tg("sendMessage", { chat_id: OWNER_ID, text: `👀 ${d.name || "она"} — ${d.step}` });
      res.writeHead(200, { "access-control-allow-origin": "*" });
      return res.end("ok");
    }
    if (u.pathname === "/track") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "content-type",
      });
      return res.end();
    }

    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("бот жив. мини-апп: /app");
  })
  .listen(PORT, () => log(`сервер поднят: http://localhost:${PORT}/app`));

// ---------------- туннель ----------------
async function tunnel() {
  if (PUBLIC_URL) { log(`используем PUBLIC_URL: ${PUBLIC_URL}`); return; }
  if (process.env.SKIP_TUNNEL === "1") { warnNoTunnel(); return; }
  return new Promise((resolve) => {
    let cf;
    try {
      cf = spawn("cloudflared", ["tunnel", "--protocol", "http2", "--url", `http://localhost:${PORT}`]);
    } catch {
      warnNoTunnel(); return resolve();
    }
    let settled = false;
    let candidate = null;
    const onData = (d) => {
      const t = d.toString();
      const m = t.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m && !candidate) {
        candidate = m[0];
        log(`туннель создан: ${candidate} — проверяю связь…`);
      }
      if (/edge discovery|Could not lookup srv|no such host/i.test(t) && !settled) {
        settled = true;
        warnNoTunnel("cloudflared не смог подключиться к сети Cloudflare (эта сеть режет DNS SRV — частая беда мобильного интернета/раздачи с телефона)");
        resolve();
      }
    };
    cf.stdout.on("data", onData);
    cf.stderr.on("data", onData);
    cf.on("error", () => { if (!settled) { settled = true; warnNoTunnel(); resolve(); } });
    cf.on("exit", () => { if (!settled) { settled = true; warnNoTunnel("cloudflared завершился, не подняв туннель"); resolve(); } });
    // считаем туннель рабочим, только если процесс жив через 8с после выдачи адреса
    const iv = setInterval(() => {
      if (candidate && !settled) {
        settled = true;
        clearInterval(iv);
        PUBLIC_URL = candidate;
        log(`туннель поднят: ${PUBLIC_URL}`);
        resolve();
      }
    }, 8000);
    setTimeout(() => { clearInterval(iv); if (!settled) { settled = true; warnNoTunnel(); resolve(); } }, 25000);
  });
}
let TUNNEL_WARNED = false;
function warnNoTunnel(reason) {
  if (TUNNEL_WARNED) return;
  TUNNEL_WARNED = true;
  console.log(`
  ⚠  публичный HTTPS-туннель не поднялся${reason ? `:\n     ${reason}` : "."}

     мини-апп внутри Telegram не откроется (Telegram пускает Web App только по https),
     но САМ БОТ и вся переписка работают.

     что делать:
       • подключись к обычному Wi-Fi (не раздача с телефона) и перезапусти:  node local.js
       • или задеплой worker.js на Cloudflare Workers (постоянный адрес, туннель не нужен):
           npx wrangler deploy
       • локальный просмотр мини-аппа в браузере:  http://localhost:${PORT}/app
`);
}

// ---------------- telegram ----------------
async function tg(method, payload) {
  try {
    const r = await fetch(`${API}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await r.json();
  } catch (e) {
    log(`ошибка ${method}: ${e.message}`);
    return {};
  }
}
const kb = (text, data) => ({ inline_keyboard: [[{ text, callback_data: data }]] });
async function typing(chat_id, ms) {
  await tg("sendChatAction", { chat_id, action: "typing" });
  await new Promise((r) => setTimeout(r, ms));
}
async function notify(from, what) {
  const who = from ? (from.first_name || "") + (from.username ? ` (@${from.username})` : "") : "она";
  log(`${who} — ${what}`);
  await tg("sendMessage", { chat_id: OWNER_ID, text: `👀 ${who} — ${what}` });
}

async function handle(u) {
  const cq = u.callback_query;
  const msg = u.message;

  if (cq) {
    const chat = cq.message.chat.id;
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    if (chat !== OWNER_ID) await notify(cq.from, `нажала «${cq.data}»`);
    else log(`(ты) нажал «${cq.data}»`);

    await tg("editMessageReplyMarkup", {
      chat_id: chat, message_id: cq.message.message_id, reply_markup: { inline_keyboard: [] },
    });

    if (cq.data === "go1") { await typing(chat, 1100); await tg("sendMessage", { chat_id: chat, text: S.s1, reply_markup: kb("и?", "go2") }); }
    if (cq.data === "go2") { await typing(chat, 1200); await tg("sendMessage", { chat_id: chat, text: S.s2, reply_markup: kb("готова", "go3") }); }
    if (cq.data === "go3") {
      await typing(chat, 1400);
      if (PUBLIC_URL) {
        await tg("sendMessage", {
          chat_id: chat, text: S.s3,
          reply_markup: { keyboard: [[{ text: "🎁 открыть", web_app: { url: `${PUBLIC_URL}/app` } }]], resize_keyboard: true },
        });
      } else {
        await tg("sendMessage", {
          chat_id: chat,
          text: S.s3 + `\n\n(туннеля нет — открой в браузере: http://localhost:${PORT}/app)`,
        });
      }
    }
    return;
  }

  if (!msg) return;
  const chat = msg.chat.id;

  if (msg.web_app_data) {
    await notify(msg.from, "🏁 ДОШЛА ДО КОНЦА");
    await tg("sendMessage", { chat_id: chat, text: S.finish, reply_markup: { remove_keyboard: true } });
    return;
  }

  if (msg.text === "/start") {
    if (chat !== OWNER_ID) await notify(msg.from, "запустила бота 🚀");
    else log("(ты) запустил бота");
    await typing(chat, 1000);
    await tg("sendMessage", { chat_id: chat, text: S.start, reply_markup: kb("давай посмотрим", "go1") });
    return;
  }

  if (msg.text) {
    if (chat !== OWNER_ID) await notify(msg.from, `написала: «${msg.text}»`);
    else log(`(ты) написал: ${msg.text}`);
    await typing(chat, 1200);
    await tg("sendMessage", { chat_id: chat, text: S.nudge, reply_markup: kb("давай посмотрим", "go1") });
  }
}

// ---------------- long polling ----------------
async function poll() {
  let offset = 0;
  // сбрасываем вебхук, иначе getUpdates не работает
  await tg("deleteWebhook", { drop_pending_updates: true });
  const me = await tg("getMe", {});
  if (me && me.ok) log(`бот: @${me.result.username}`);
  else { log("токен не принят — проверь TELEGRAM_TOKEN"); return; }
  log("слушаю сообщения. открой бота и жми /start");

  for (;;) {
    const r = await tg("getUpdates", { offset, timeout: 25 });
    if (r && r.ok) {
      for (const u of r.result) {
        offset = u.update_id + 1;
        handle(u).catch((e) => log("ошибка: " + e.message));
      }
    } else {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

function log(m) {
  const t = new Date().toLocaleTimeString("ru-RU");
  console.log(`[${t}] ${m}`);
}

await tunnel();
poll();
