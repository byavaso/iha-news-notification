import * as fs from 'fs';
import * as path from 'path';

const STORE_FILE = path.join(__dirname, '..', 'sent-news.json');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface SentNews {
  [haberKodu: string]: number; // timestamp
}

function loadStore(): SentNews {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Store dosyası okunamadı:', error);
  }
  return {};
}

function saveStore(store: SentNews): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('Store dosyası yazılamadı:', error);
  }
}

export function cleanOldEntries(): void {
  const store = loadStore();
  const now = Date.now();
  let cleaned = 0;

  for (const haberKodu of Object.keys(store)) {
    if (now - store[haberKodu] > ONE_DAY_MS) {
      delete store[haberKodu];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    saveStore(store);
    console.log(`${cleaned} eski kayıt temizlendi.`);
  }
}

export function isAlreadySent(haberKodu: string): boolean {
  const store = loadStore();
  return haberKodu in store;
}

export function markAsSent(haberKodu: string): void {
  const store = loadStore();
  store[haberKodu] = Date.now();
  saveStore(store);
}
