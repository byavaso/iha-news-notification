# IHA Haber Bildirim Sistemi - Tasarım Dökümanı

## Amaç

IHA RSS feed'inden belirli kriterlere uyan haberleri takip edip Telegram'a anlık bildirim göndermek. 2-3 kişilik haber ekibinin rakiplerden önce haberleri yakalaması için tasarlandı.

## Gereksinimler

- **RSS Kaynağı:** IHA standart RSS
- **Filtreler:** Şehir=AYDIN VEYA Kategori=HABERDE İNSAN
- **Kontrol Sıklığı:** Her 1 dakika
- **Bildirim Kanalı:** Telegram
- **Çalışma Ortamı:** Lokal bilgisayar
- **Teknoloji:** Node.js + TypeScript

## Proje Yapısı

```
iha-news-notification/
├── src/
│   ├── index.ts          # Ana giriş noktası, zamanlayıcı
│   ├── rss-fetcher.ts    # RSS'i çeker ve parse eder
│   ├── filter.ts         # Şehir/kategori filtreleme
│   ├── telegram.ts       # Telegram bildirimi gönderir
│   └── store.ts          # Gönderilmiş haberleri takip eder
├── config.json           # Filtreler (şehir, kategori listesi)
├── .env                  # Telegram bot token ve chat ID
├── sent-news.json        # Hangi haberler gönderildi
├── package.json
└── tsconfig.json
```

## Akış

1. Her 1 dakikada `rss-fetcher` RSS'i çeker
2. `filter` AYDIN veya HABERDE İNSAN olanları süzer
3. `store` daha önce gönderilmemiş olanları belirler
4. `telegram` yeni haberleri Telegram'a gönderir
5. `store` gönderilen HaberKodu'larını kaydeder

## Konfigürasyon

**config.json:**
```json
{
  "rssUrl": "http://abonerss.iha.com.tr/xml/standartrss?UserCode=19&UserName=yenisoke&UserPassword=rss9777&tip=1&UstKategori=0&Kategori=0&Sehir=0&wp=0&tagp=0",
  "checkIntervalMs": 60000,
  "filters": {
    "cities": ["AYDIN"],
    "categories": ["HABERDE İNSAN"]
  }
}
```

**.env:**
```
TELEGRAM_BOT_TOKEN=<bot_token>
TELEGRAM_CHAT_ID=<chat_id>
```

## Telegram Mesaj Formatı

```
📰 Didim'de sağanak yağış etkili oldu

📍 AYDIN | ÇEVRE
🕐 29.11.2025 13:47

Ege Bölgesi için yapılan şiddetli yağış uyarısı
sonrasında Aydın'ın Didim ilçesinde yağışlar
etkili oldu...

#IHA #20251129AW589425
```

## Store Yönetimi (sent-news.json)

- Her kayıtta `HaberKodu` + `timestamp` tutulur
- 24 saatten eski kayıtlar otomatik silinir
- Böylece dosya şişmez

```json
{
  "20251129AW589425": 1732883245000,
  "20251129AW589430": 1732883305000
}
```

## Kütüphaneler

- `xml2js` - RSS XML parse
- `node-telegram-bot-api` - Telegram API
- `dotenv` - Ortam değişkenleri
- `setInterval` - Zamanlama (basit tutuyoruz)

## Hata Yönetimi

- RSS çekilemezse → Log yaz, sonraki döngüde tekrar dene
- Telegram gönderilemezse → Log yaz, haberi gönderilmemiş işaretle
- Parse hatası → O haberi atla, diğerlerine devam et
