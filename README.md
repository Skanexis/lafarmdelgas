
  # TERPS DRAGON

  Catalogo digitale TERPS DRAGON con vetrina prodotti, schede compatte in modale e pagina contatti.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  Run `npm run backend` to start the local API server on `http://127.0.0.1:8787`.

  Run `npm run bot` to start the Telegram bot after setting:

  ```env
  TELEGRAM_BOT_TOKEN=...
  TELEGRAM_WEBAPP_URL=https://your-domain.com
  TELEGRAM_ADMIN_IDS=123456789
  BOT_REQUIRED_CHANNEL=-1001234567890
  BOT_JOIN_URL=https://t.me/+private_channel_invite
  VITE_TELEGRAM_GATE=true
  ```

  In admin panel open `Telegram` to change the required private channel without rebuild.
  The bot must be an admin in that channel to check subscriptions.

  Copy `.env.example` to `.env` when you need to change API host, port or admin token.
  
