#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// scripts/seed.js — Idempotent Database Seed
// Safe to run multiple times. INSERT OR IGNORE for templates.
// Demo user only in development.
// ═══════════════════════════════════════════════════════════════

const path = require('path');

// Load .env.local if available (local dev); production uses system env
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch { /* dotenv not in production deps — OK */ }

const { getDb, templateQueries, userQueries } = require('../lib/db');
const { TEMPLATES } = require('../lib/templates');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function seed() {
  console.log('🌱 Sözhane — Veritabanı seed başlatılıyor...');
  console.log(`   Ortam: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`   DB: ${process.env.DATABASE_PATH || '(default)'}\n`);

  const db = getDb();

  // ── 1. Templates (INSERT OR IGNORE — idempotent) ─────────
  console.log('📋 Şablonlar kontrol ediliyor...');

  const insertIgnore = templateQueries.upsert(db);

  let inserted = 0;
  let skipped = 0;

  for (const t of TEMPLATES) {
    const existing = templateQueries.getById(db).get(t.id);

    if (existing) {
      skipped++;
      console.log(`  ⏭  ${t.icon} ${t.title} (zaten mevcut — id: ${t.id})`);
    } else {
      insertIgnore.run(
        t.id,
        t.title,
        t.icon,
        t.description,
        t.category,
        t.is_popular,
        JSON.stringify(t.fields_schema),
        t.base_text,
        t.sort_order,
      );
      inserted++;
      console.log(`  ✓  ${t.icon} ${t.title} (eklendi — id: ${t.id})`);
    }
  }

  console.log(`   → ${inserted} eklendi, ${skipped} atlandı\n`);

  // ── 2. Demo User (DEVELOPMENT ONLY) ─────────────────────
  if (IS_PRODUCTION) {
    console.log('👤 Production modu — demo kullanıcı ATLANILDI.\n');
  } else {
    console.log('👤 Demo kullanıcı (sadece dev)...');

    const demoEmail = 'demo@sozhane.com';
    const existing = userQueries.findByEmail(db).get(demoEmail);

    if (!existing) {
      const demoId = uuid();
      const hash = await bcrypt.hash('demo123', 10);

      userQueries.create(db).run(
        demoId,
        demoEmail,
        hash,
        'Demo Kullanıcı',
        'pro',
        999,
      );
      console.log(`  ✓ Oluşturuldu: ${demoEmail} / demo123\n`);
    } else {
      console.log(`  ⏭ Zaten mevcut: ${demoEmail}\n`);
    }
  }

  // ── 3. Doğrulama ────────────────────────────────────────
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM contract_templates').get();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

  console.log('📊 Durum:');
  console.log(`   Şablonlar: ${templateCount.count}`);
  console.log(`   Kullanıcılar: ${userCount.count}`);
  console.log('\n✅ Seed tamamlandı.\n');

  if (!IS_PRODUCTION) {
    console.log('─────────────────────────────────────────');
    console.log(' Demo giriş: demo@sozhane.com / demo123');
    console.log('─────────────────────────────────────────\n');
  }
}

seed().catch(err => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
