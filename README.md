# Sözhane — Türkçe Hukuki Sözleşme Otomasyonu

AI destekli, Türk hukukuna uygun sözleşme oluşturma platformu.

## Hızlı Başlangıç

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Environment değişkenlerini ayarla
cp .env.local.example .env.local
# .env.local dosyasında ANTHROPIC_API_KEY'i güncelle

# 3. Veritabanını seed'le
npm run seed

# 4. Çalıştır
npm run dev
```

Tarayıcıda: **http://localhost:3000**

Demo giriş: `demo@sozhane.com` / `demo123`

---

## Mimari

```
sozhane/
├── app/                      # Next.js App Router
│   ├── layout.js             # Root layout
│   ├── page.js               # Entry point → SozhaneApp
│   ├── globals.css            # Tailwind + custom styles
│   └── api/
│       ├── auth/
│       │   ├── register/     # POST - kayıt
│       │   ├── login/        # POST - giriş
│       │   └── me/           # GET - current user, DELETE - logout
│       ├── templates/        # GET - şablon listesi
│       ├── contracts/
│       │   ├── route.js      # GET - liste, POST - oluştur (+ AI)
│       │   └── [id]/         # GET - tekil sözleşme
│       ├── ai/generate/      # POST - AI düzenleme
│       ├── pdf/generate/     # POST - PDF oluştur + stream
│       └── payments/         # POST - plan aktivasyonu
├── components/
│   └── SozhaneApp.jsx        # Full client-side SPA
├── lib/
│   ├── db.js                 # SQLite (better-sqlite3) + schema
│   ├── auth.js               # JWT + bcrypt
│   ├── ai.js                 # Anthropic API entegrasyonu
│   ├── pdf.js                # Puppeteer PDF generation
│   ├── templates.js          # 4 şablon seed data
│   └── api-client.js         # Frontend fetch wrapper
├── middleware.js              # Route protection
└── scripts/
    └── seed.js               # DB seed (templates + demo user)
```

## Veritabanı Şeması

| Tablo | Açıklama |
|---|---|
| `users` | Kullanıcılar (email, plan, contract limit) |
| `contract_templates` | 4 şablon (JSON fields_schema + base_text) |
| `contracts` | Oluşturulan sözleşmeler (form data + AI text + notes) |
| `contract_versions` | Sözleşme versiyonları |
| `payments` | Ödeme kayıtları |

## API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/register` | Kayıt (name, email, password) |
| POST | `/api/auth/login` | Giriş (email, password) |
| GET | `/api/auth/me` | Current user (cookie auth) |
| DELETE | `/api/auth/me` | Çıkış |

### Templates
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/templates` | Tüm aktif şablonları listele |

### Contracts
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/contracts` | Kullanıcının sözleşmeleri |
| POST | `/api/contracts` | Yeni sözleşme oluştur (AI dahil) |
| GET | `/api/contracts/:id` | Tekil sözleşme + versiyonlar |

### AI
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/ai/generate` | AI ile sözleşme düzenle |

### PDF
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/pdf/generate` | PDF oluştur ve stream et |

### Payments
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/payments` | Plan aktivasyonu |

## Şablonlar

1. **🔒 Gizlilik Sözleşmesi (NDA)** — 12 alan, 6 bölüm
2. **📋 Hizmet Sözleşmesi** — 16 alan, 6 bölüm
3. **💼 Freelance Sözleşme** — 16 alan, 7 bölüm
4. **🤝 Ortaklık Sözleşmesi** — 16 alan, 7 bölüm

Tüm şablonlar 6098 sayılı TBK ve ilgili mevzuat referanslıdır.

## Fiyatlandırma

| Plan | Fiyat | İçerik |
|---|---|---|
| Başlangıç | ₺199 tek seferlik | 5 sözleşme |
| Profesyonel | ₺49/ay | Sınırsız sözleşme |

## Production Checklist

- [ ] `ANTHROPIC_API_KEY` production key ile değiştir
- [ ] `JWT_SECRET` güçlü secret ile değiştir
- [ ] Stripe entegrasyonunu aktif et (checkout session)
- [ ] PostgreSQL'e geçiş (SQLite → Prisma + Supabase/Neon)
- [ ] Rate limiting ekle
- [ ] Email doğrulama ekle
- [ ] HTTPS zorunlu kıl
- [ ] Error monitoring (Sentry)
- [ ] Vercel/Railway'e deploy et
