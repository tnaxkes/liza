import { S, PAGE } from "../lib/page.mjs";

const OWNER_ID = 952560202;
const API = () => `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `https://${host}`;
  const path = req.url.split("?")[0];

  if (path === "/app") {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    return res.end(PAGE(origin));
  }

  if (path === "/track") {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type");
    if (req.method !== "POST") { res.statusCode = 204; return res.end(); }
    const { step, name } = body(req);
    await tg("sendMessage", { chat_id: OWNER_ID, text: `👀 ${name || "она"} — ${step}` });
    return res.end("ok");
  }

  if (path === "/diag") {
    const t = process.env.TELEGRAM_TOKEN || "";
    let me = null;
    try { me = await (await fetch(`https://api.telegram.org/bot${t}/getMe`)).json(); } catch (e) { me = { error: String(e) }; }
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ hasToken: !!t, tokenLen: t.length, getMe: me }));
  }

  if (path === "/webhook" && req.method === "POST") {
    try { await handle(body(req), origin); } catch (e) { /* не роняем вебхук */ }
    return res.end("ok");
  }

  res.end("бот жив");
}

function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

// ---------- логика бота ----------
async function handle(u, origin) {
  const cq = u.callback_query;
  const msg = u.message;

  if (cq) {
    const chat = cq.message.chat.id;
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    if (chat !== OWNER_ID) await notify(cq.from, `нажала «${cq.data}»`);
    await tg("editMessageReplyMarkup", { chat_id: chat, message_id: cq.message.message_id, reply_markup: { inline_keyboard: [] } });

    if (cq.data === "go1") { await typing(chat, 1200); await send(chat, S.ask); }
    if (cq.data === "go2") { await typing(chat, 1400); await send(chat, S.step2, kb("и что дальше?", "go3")); }
    if (cq.data === "go3") {
      await typing(chat, 1400);
      await tg("sendMessage", {
        chat_id: chat,
        text: S.step3,
        reply_markup: { keyboard: [[{ text: "🎁 открыть", web_app: { url: `${origin}/app` } }]], resize_keyboard: true },
      });
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
    await typing(chat, 1000);
    await send(chat, S.start, kb("ну ладно, я слушаю", "go1"));
    return;
  }

  if (msg.text) {
    if (chat !== OWNER_ID) await notify(msg.from, `написала: «${msg.text}»`);
    await typing(chat, 1200);
    await send(chat, S.after_text, kb("что скажешь?", "go2"));
  }
}

// ---------- helpers ----------
const kb = (text, data) => ({ inline_keyboard: [[{ text, callback_data: data }]] });
async function send(chat_id, text, reply_markup) { await tg("sendMessage", { chat_id, text, reply_markup }); }
async function typing(chat_id, ms) {
  await tg("sendChatAction", { chat_id, action: "typing" });
  await new Promise((r) => setTimeout(r, ms));
}
async function notify(from, what) {
  const who = from ? (from.first_name || "") + (from.username ? ` (@${from.username})` : "") : "она";
  await tg("sendMessage", { chat_id: OWNER_ID, text: `👀 ${who} — ${what}` });
}
async function tg(method, payload) {
  const r = await fetch(`${API()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}
