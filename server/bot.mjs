import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const settingsFile = join(dataDir, 'bot-settings.json');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBAPP_URL;
const adminIds = new Set(
  String(process.env.TELEGRAM_ADMIN_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean),
);

const defaultSettings = {
  requiredChat: process.env.BOT_REQUIRED_CHANNEL || process.env.BOT_REQUIRED_CHAT || '',
  joinUrl: process.env.BOT_JOIN_URL || '',
  enabled: process.env.BOT_REQUIRE_SUBSCRIPTION !== 'false',
};

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

if (!webAppUrl) {
  throw new Error('TELEGRAM_WEBAPP_URL is required');
}

await ensureSettingsFile();
await deleteWebhook();
await pollUpdates();

async function ensureSettingsFile() {
  await mkdir(dataDir, { recursive: true });

  if (!existsSync(settingsFile)) {
    await writeJson(settingsFile, defaultSettings);
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeSettings(input, current = defaultSettings) {
  return {
    ...current,
    requiredChat:
      typeof input.requiredChat === 'string' ? input.requiredChat.trim() : current.requiredChat,
    joinUrl: typeof input.joinUrl === 'string' ? input.joinUrl.trim() : current.joinUrl,
    enabled: typeof input.enabled === 'boolean' ? input.enabled : current.enabled,
  };
}

async function readSettings() {
  return normalizeSettings(await readJson(settingsFile, defaultSettings));
}

async function saveSettings(nextSettings) {
  const settings = normalizeSettings(nextSettings, await readSettings());
  await writeJson(settingsFile, settings);
  return settings;
}

async function callTelegram(method, payload = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || `Telegram ${method} failed`);
  }

  return data.result;
}

async function deleteWebhook() {
  await callTelegram('deleteWebhook', { drop_pending_updates: false });
}

async function pollUpdates() {
  let offset = 0;
  console.log('TERPS DRAGON Telegram bot polling started');

  while (true) {
    try {
      const updates = await callTelegram('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query'],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        await handleUpdate(update).catch(error => {
          console.error('Update handling failed:', error.message);
        });
      }
    } catch (error) {
      console.error('Polling failed:', error.message);
      await wait(1500);
    }
  }
}

async function handleUpdate(update) {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }

  const message = update.message;
  if (!message?.chat?.id) return;

  const text = String(message.text || '').trim();

  if (text.startsWith('/setchannel') || text.startsWith('/setgroup')) {
    await handleAdminSetChannel(message, text);
    return;
  }

  if (text.startsWith('/setinvite')) {
    await handleAdminSetInvite(message, text);
    return;
  }

  if (text.startsWith('/botstatus')) {
    await handleAdminStatus(message);
    return;
  }

  if (text.startsWith('/start')) {
    await sendStart(message.chat.id, message.from?.id);
  }
}

async function handleCallback(callback) {
  const chatId = callback.message?.chat?.id;
  const userId = callback.from?.id;

  if (callback.data === 'check_subscription' && chatId && userId) {
    const subscribed = await isSubscribed(userId);
    await callTelegram('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: subscribed ? 'Доступ открыт' : 'Подписка не найдена',
      show_alert: false,
    });

    if (subscribed) {
      await sendMiniApp(chatId);
    } else {
      await sendSubscriptionGate(chatId);
    }
  }
}

async function sendStart(chatId, userId) {
  if (await isSubscribed(userId)) {
    await sendMiniApp(chatId);
    return;
  }

  await sendSubscriptionGate(chatId);
}

async function sendSubscriptionGate(chatId) {
  const settings = await readSettings();
  const keyboard = [];

  if (settings.joinUrl) {
    keyboard.push([{ text: 'Подписаться', url: settings.joinUrl }]);
  }

  keyboard.push([{ text: 'Проверить', callback_data: 'check_subscription' }]);

  await callTelegram('sendMessage', {
    chat_id: chatId,
    text: 'Сначала подпишись на канал.',
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
}

async function sendMiniApp(chatId) {
  await callTelegram('sendMessage', {
    chat_id: chatId,
    text: 'Доступ открыт.',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть',
            web_app: { url: webAppUrl },
          },
        ],
      ],
    },
  });
}

async function isSubscribed(userId) {
  const settings = await readSettings();

  if (!settings.enabled || !settings.requiredChat) {
    return true;
  }

  if (!userId) {
    return false;
  }

  try {
    const member = await callTelegram('getChatMember', {
      chat_id: settings.requiredChat,
      user_id: userId,
    });

    if (member.status === 'restricted') {
      return Boolean(member.is_member);
    }

    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch {
    return false;
  }
}

function isAdmin(message) {
  return adminIds.has(String(message.from?.id || ''));
}

async function handleAdminSetChannel(message, text) {
  if (!isAdmin(message)) return;

  const requiredChat = text.replace(/^\/set(channel|group)(@\w+)?\s*/i, '').trim();
  if (!requiredChat) {
    await callTelegram('sendMessage', {
      chat_id: message.chat.id,
      text: 'Формат: /setchannel -1001234567890 или @channel_username',
    });
    return;
  }

  const settings = await saveSettings({ requiredChat, enabled: true });
  await callTelegram('sendMessage', {
    chat_id: message.chat.id,
    text: `Канал: ${settings.requiredChat}`,
  });
}

async function handleAdminSetInvite(message, text) {
  if (!isAdmin(message)) return;

  const joinUrl = text.replace(/^\/setinvite(@\w+)?\s*/i, '').trim();
  if (!joinUrl) {
    await callTelegram('sendMessage', {
      chat_id: message.chat.id,
      text: 'Формат: /setinvite https://t.me/+invite',
    });
    return;
  }

  const settings = await saveSettings({ joinUrl });
  await callTelegram('sendMessage', {
    chat_id: message.chat.id,
    text: `Invite: ${settings.joinUrl}`,
  });
}

async function handleAdminStatus(message) {
  if (!isAdmin(message)) return;

  const settings = await readSettings();
  await callTelegram('sendMessage', {
    chat_id: message.chat.id,
    text: [
      `enabled: ${settings.enabled}`,
      `requiredChat: ${settings.requiredChat || '-'}`,
      `joinUrl: ${settings.joinUrl || '-'}`,
      `webApp: ${webAppUrl ? 'ok' : '-'}`,
    ].join('\n'),
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
