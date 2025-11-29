# IHA News Notification

IHA (İhlas Haber Ajansı) RSS beslemesinden belirli kriterlere uyan haberleri takip edip Telegram'a anlık bildirim gönderen bir araç.

## Özellikler

- 📡 **RSS Takibi** - IHA RSS beslemesini her dakika kontrol eder
- 🎯 **Akıllı Filtreleme** - Şehir ve/veya kategori bazlı filtreleme
- 📱 **Telegram Bildirimi** - Yeni haberler anında Telegram'a düşer
- 🔄 **Tekrar Önleme** - Aynı haber iki kez gönderilmez (24 saat hafıza)
- 🚀 **Otomatik Başlatma** - macOS'ta sistem açılışında otomatik çalışır

## Kurulum

### Gereksinimler

- Node.js 18+
- Telegram Bot Token ([BotFather](https://t.me/botfather)'dan alınır)
- Telegram Chat ID (grup veya kanal)

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/byavaso/iha-news-notification.git
cd iha-news-notification

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
nano .env  # Token ve Chat ID'yi gir

# Derle ve çalıştır
npm run build
npm start
```

## Yapılandırma

### .env

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### config.json

```json
{
  "rssUrl": "http://abonerss.iha.com.tr/xml/standartrss?...",
  "checkIntervalMs": 60000,
  "filters": {
    "cities": ["AYDIN"],
    "categoryRules": [
      { "ustKategori": "ULUSAL HABER", "kategori": "HABERDE İNSAN" }
    ]
  }
}
```

**Filtre Mantığı:** Şehir listesindeki haberler **VEYA** kategori kurallarına uyan haberler bildirilir.

## Telegram Bot Kurulumu

1. [@BotFather](https://t.me/botfather)'ı aç
2. `/newbot` komutuyla yeni bot oluştur
3. Bot token'ını `.env` dosyasına kaydet
4. Bir grup/kanal oluştur ve botu ekle (admin yap)
5. Chat ID'yi almak için:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   adresini ziyaret et ve gruba mesaj at

## macOS Otomatik Başlatma

```bash
# LaunchAgent oluştur
cat > ~/Library/LaunchAgents/com.byavaso.iha-news-notification.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.byavaso.iha-news-notification</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/path/to/iha-news-notification/dist/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/iha-news-notification</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Servisi başlat
launchctl load ~/Library/LaunchAgents/com.byavaso.iha-news-notification.plist
```

### Servis Yönetimi

```bash
# Durum kontrolü
launchctl list | grep iha-news

# Durdur
launchctl unload ~/Library/LaunchAgents/com.byavaso.iha-news-notification.plist

# Başlat
launchctl load ~/Library/LaunchAgents/com.byavaso.iha-news-notification.plist

# Logları izle
tail -f ~/Code/iha-news-notification/logs/output.log
```

## Proje Yapısı

```
iha-news-notification/
├── src/
│   ├── index.ts          # Ana uygulama ve zamanlayıcı
│   ├── rss-fetcher.ts    # RSS çekme ve parse
│   ├── filter.ts         # Haber filtreleme
│   ├── telegram.ts       # Telegram bildirimi
│   ├── store.ts          # Gönderilmiş haber takibi
│   └── types.ts          # TypeScript tipleri
├── config.json           # Filtre ayarları
├── .env                  # Gizli bilgiler (git'e dahil değil)
└── sent-news.json        # Gönderilmiş haberler (otomatik oluşur)
```

## Bildirim Formatı

```
📰 Haber Başlığı

📍 AYDIN | GÜNCEL
🕐 29.11.2025 14:30

Haber özeti burada görünür...

#IHA #20251129AW123456
```

## Lisans

MIT
