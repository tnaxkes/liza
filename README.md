# ДР-бот для Лизы

## Запуск локально (сейчас работает так)
```bash
node local.js
```
Бот: @ZFVSKVSDVS_BOT. Открой его в Telegram и нажми /start.
Все её шаги падают тебе в личку (id 952560202).

## Про мини-апп
Мини-апп поднимается на http://localhost:8787/app
Чтобы он открывался ВНУТРИ Telegram, нужен публичный https-адрес:

- **Сейчас туннель не поднимается** — эта сеть (раздача с телефона) режет DNS.
  Подключись к обычному Wi-Fi и перезапусти `node local.js` — туннель поднимется сам.
- **Или задеплой на Cloudflare Workers** (постоянный адрес, туннель не нужен):
  ```bash
  npm i -g wrangler && wrangler deploy
  ```
  потом привяжи webhook:
  curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<worker>.workers.dev/webhook"

## Файлы
- local.js — локальный запуск (long polling)
- worker.js — весь бот + мини-апп для Cloudflare Workers (17 фото уже вшиты)
- preview.html — мини-апп одним файлом для быстрого просмотра
