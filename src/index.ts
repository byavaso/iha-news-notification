import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';
import { fetchRSS } from './rss-fetcher';
import { filterNews } from './filter';
import { initTelegram, sendNewsNotification } from './telegram';
import { isAlreadySent, markAsSent, cleanOldEntries } from './store';

// Config yükle
const configPath = path.join(__dirname, '..', 'config.json');
const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Ortam değişkenlerini kontrol et
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('HATA: .env dosyasında TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID tanımlanmalı!');
  process.exit(1);
}

// Telegram'ı başlat
initTelegram(TELEGRAM_BOT_TOKEN);

async function checkNews(): Promise<void> {
  console.log(`[${new Date().toLocaleString('tr-TR')}] RSS kontrol ediliyor...`);

  // RSS'i çek
  const allNews = await fetchRSS(config.rssUrl);

  if (allNews.length === 0) {
    console.log('Haber bulunamadı veya RSS çekilemedi.');
    return;
  }

  // Filtrele
  const filteredNews = filterNews(allNews, config);
  console.log(`Toplam: ${allNews.length}, Filtrelenmiş: ${filteredNews.length}`);

  // Yeni haberleri bul ve gönder
  let sentCount = 0;
  for (const news of filteredNews) {
    if (isAlreadySent(news.haberKodu)) {
      continue;
    }

    console.log(`Yeni haber: ${news.title}`);
    const success = await sendNewsNotification(TELEGRAM_CHAT_ID, news);

    if (success) {
      markAsSent(news.haberKodu);
      sentCount++;
    }
    // Rate limit için bekleme (başarılı veya başarısız)
    await sleep(3000);
  }

  if (sentCount > 0) {
    console.log(`${sentCount} yeni haber gönderildi.`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log('=================================');
  console.log('IHA Haber Bildirim Sistemi');
  console.log('=================================');
  const ruleText = config.filters.categoryRules.map(r => `${r.ustKategori}/${r.kategori}`).join(', ');
  console.log(`Filtreler: Şehir=${config.filters.cities.join(', ')}, Kurallar=${ruleText}`);
  console.log(`Kontrol aralığı: ${config.checkIntervalMs / 1000} saniye`);
  console.log('');

  // Başlangıçta eski kayıtları temizle
  cleanOldEntries();

  // İlk kontrolü hemen yap
  await checkNews();

  // Zamanlayıcıyı başlat
  setInterval(checkNews, config.checkIntervalMs);

  // Her saat eski kayıtları temizle
  setInterval(cleanOldEntries, 60 * 60 * 1000);

  console.log('Sistem çalışıyor. Durdurmak için Ctrl+C');
}

main().catch(console.error);
