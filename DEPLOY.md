# Sözhane — Deploy Rehberi

## Ön Gereksinimler

1. **GitHub repo** — Kodu push et
2. **Stripe hesabı** — https://dashboard.stripe.com (prod'da ZORUNLU)
3. **Anthropic API Key** — https://console.anthropic.com (opsiyonel, yoksa standart şablon çalışır)

---

## Railway ile Deploy (Önerilen — 5 Dakika)

### 1. Railway hesabı aç
https://railway.app → GitHub ile giriş

### 2. Proje oluştur
Dashboard → **New Project** → **Deploy from GitHub repo** → repo'yu seç

Railway `Dockerfile`'ı otomatik algılar.

### 3. Volume ekle (KRİTİK)
Servis → **Settings** → **Volumes** → **Add Volume**
```
Mount path: /data
```
Bu olmadan her deploy'da DB sıfırlanır!

### 4. Environment Variables

Railway Dashboard → **Variables** sekmesinde şunları ekle:

#### ZORUNLU
| Değişken | Değer | Açıklama |
|---|---|---|
| `JWT_SECRET` | `openssl rand -base64 32` | Auth token imzalama |
| `DATABASE_PATH` | `/data/sozhane.db` | SQLite dosya yolu (volume içinde) |
| `APP_URL` | `https://SENIN-DOMAIN.up.railway.app` | Backend callback URL |
| `NEXT_PUBLIC_APP_URL` | `https://SENIN-DOMAIN.up.railway.app` | Frontend base URL |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe API anahtarı |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook imza doğrulama |
| `STRIPE_PRICE_ONE_TIME_TRY` | `price_...` | Başlangıç planı Price ID |
| `STRIPE_PRICE_SUB_MONTHLY_TRY` | `price_...` | Pro planı Price ID |

#### OPSİYONEL
| Değişken | Değer | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | AI düzenleme (yoksa standart şablon) |
| `PDF_DIR` | `/data/pdfs` | PDF çıktı dizini |
| `PORT` | `3000` | Railway otomatik atar |

### 5. Stripe Yapılandırması

#### 5a. Product & Price oluştur
1. https://dashboard.stripe.com/products → **Add product**
2. **Başlangıç Planı:**
   - Ad: `Sözhane Başlangıç`
   - Price: ₺199 TRY, One-time
   - → Price ID'yi kopyala → `STRIPE_PRICE_ONE_TIME_TRY`
3. **Pro Planı:**
   - Ad: `Sözhane Profesyonel`
   - Price: ₺49/ay TRY, Recurring monthly
   - → Price ID'yi kopyala → `STRIPE_PRICE_SUB_MONTHLY_TRY`

#### 5b. Webhook oluştur
1. https://dashboard.stripe.com/webhooks → **Add endpoint**
2. URL: `https://SENIN-DOMAIN.up.railway.app/api/payments/webhook`
3. Events seç:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Signing secret → kopyala → `STRIPE_WEBHOOK_SECRET`

### 6. Deploy
Railway otomatik build eder. İlk build ~3-5 dakika.

### 7. Domain
Settings → Networking → **Generate Domain**
Veya custom domain: CNAME kaydı ekle.

### 8. Doğrulama
```bash
# Health check
curl https://SENIN-DOMAIN.up.railway.app/api/health
# → {"status":"ok","db":"connected","templates":4}

# Templates
curl https://SENIN-DOMAIN.up.railway.app/api/templates
# → {"templates":[...4 şablon...]}
```

---

## Docker ile Deploy (VPS / Self-hosted)

```bash
# Build
docker build -t sozhane .

# Run
docker run -d \
  --name sozhane \
  -p 3000:3000 \
  -v sozhane-data:/data \
  -e NODE_ENV=production \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e DATABASE_PATH=/data/sozhane.db \
  -e PDF_DIR=/data/pdfs \
  -e APP_URL=https://sozhane.com \
  -e NEXT_PUBLIC_APP_URL=https://sozhane.com \
  -e STRIPE_SECRET_KEY=sk_live_xxx \
  -e STRIPE_WEBHOOK_SECRET=whsec_xxx \
  -e STRIPE_PRICE_ONE_TIME_TRY=price_xxx \
  -e STRIPE_PRICE_SUB_MONTHLY_TRY=price_xxx \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  sozhane

# Loglar
docker logs -f sozhane
```

#### Nginx + SSL (Let's Encrypt)
```nginx
server {
    listen 443 ssl http2;
    server_name sozhane.com;

    ssl_certificate     /etc/letsencrypt/live/sozhane.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sozhane.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Fly.io ile Deploy (Alternatif)

```bash
fly launch --name sozhane --region fra --no-deploy
fly volumes create sozhane_data --size 1 --region fra
fly secrets set \
  JWT_SECRET="$(openssl rand -base64 32)" \
  DATABASE_PATH=/data/sozhane.db \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  STRIPE_PRICE_ONE_TIME_TRY=price_xxx \
  STRIPE_PRICE_SUB_MONTHLY_TRY=price_xxx
fly deploy
```

`fly.toml`'a ekle:
```toml
[mounts]
  source = "sozhane_data"
  destination = "/data"
```

---

## Güvenlik Notları

| Konu | Detay |
|---|---|
| **Dev fallback** | `NODE_ENV=production`'da Stripe olmadan ödeme YAPILMAZ. 503 döner. |
| **Demo user** | Production seed'de demo kullanıcı OLUŞTURULMAZ. |
| **Seed idempotent** | `INSERT OR IGNORE` — tekrar çalıştırmak güvenli. |
| **Chromium** | Docker'da system `/usr/bin/chromium` kullanılır, Puppeteer download atlanır. |
| **Webhook** | Stripe signature (HMAC-SHA256) ile doğrulanır. |
| **JWT** | HttpOnly cookie, 7 gün expiry. |

---

## Post-Deploy Checklist

```
✅ Altyapı
[ ] /api/health → {"status":"ok","templates":4}
[ ] Landing page yükleniyor
[ ] Volume mount: /data dizini kalıcı
[ ] Chromium çalışıyor (PDF testi)

✅ Auth Akışı
[ ] Kayıt → Giriş → Çıkış çalışıyor
[ ] Cookie set/clear ediliyor

✅ Ödeme Akışı
[ ] Pricing → Stripe Checkout'a yönlendiriliyor
[ ] Test kart (4242 4242 4242 4242) ile ödeme tamamlanıyor
[ ] Webhook: plan aktifleşiyor
[ ] Stripe Dashboard'da event logları temiz

✅ Sözleşme Akışı
[ ] Şablon seç → Form doldur → AI oluştur
[ ] Sözleşme DB'ye kaydediliyor
[ ] PDF indirme çalışıyor
[ ] Sözleşme detayından tekrar PDF indirilebiliyor
[ ] Dashboard'da listeleniyor

✅ Güvenlik
[ ] JWT_SECRET production-grade (32+ karakter)
[ ] HTTPS aktif (Railway/Fly otomatik)
[ ] Stripe live keys kullanılıyor
[ ] Demo user yok (prod seed kontrolü)
```

---

## Sorun Giderme

| Sorun | Çözüm |
|---|---|
| DB boş / şablonlar yok | Volume mount kontrol: `docker exec sozhane ls -la /data/` |
| PDF oluşturulmuyor | `docker exec sozhane which chromium` → `/usr/bin/chromium` olmalı |
| Stripe 503 hatası | `STRIPE_SECRET_KEY` set mi? Production'da ZORUNLU. |
| AI düzenleme yok | `ANTHROPIC_API_KEY` opsiyonel — standart şablon çalışır. |
| Webhook 401 | `/api/payments/webhook` public route'larda mı? → Evet. |
| İlk deploy yavaş | Normal — Chromium + npm install ~3-5 dk. Sonraki deploylar cache ile hızlı. |
