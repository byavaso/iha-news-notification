import TelegramBot from 'node-telegram-bot-api';
import { NewsItem } from './types';

let bot: TelegramBot | null = null;

export function initTelegram(token: string): void {
  bot = new TelegramBot(token, { polling: false });
}

export async function sendNewsNotification(
  chatId: string,
  news: NewsItem
): Promise<boolean> {
  if (!bot) {
    console.error('Telegram bot başlatılmamış!');
    return false;
  }

  try {
    const message = formatMessage(news);
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Telegram mesajı gönderilemedi:', error);
    return false;
  }
}

function formatMessage(news: NewsItem): string {
  const description = truncate(news.description, 300);

  const lines = [
    `<b>📰 ${escapeHtml(news.title)}</b>`,
    '',
    `📍 ${escapeHtml(news.sehir)} | ${escapeHtml(news.kategori)}`,
    `🕐 ${news.pubDate}`,
    '',
    escapeHtml(description),
    '',
    `#IHA #${news.haberKodu}`,
  ];

  return lines.join('\n');
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
