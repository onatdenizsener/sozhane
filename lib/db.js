// ═══════════════════════════════════════════════════════════════
// lib/db.js — SQLite Database Layer (better-sqlite3)
// ═══════════════════════════════════════════════════════════════

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'sozhane.db');

let _db = null;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

// ── Schema ───────────────────────────────────────────────────
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY,
      email           TEXT UNIQUE NOT NULL,
      password_hash   TEXT NOT NULL,
      name            TEXT NOT NULL,
      plan            TEXT DEFAULT NULL,          -- 'starter' | 'pro' | null
      contracts_left  INTEGER DEFAULT 0,
      stripe_customer_id TEXT DEFAULT NULL,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contract_templates (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      icon            TEXT NOT NULL DEFAULT '📄',
      description     TEXT NOT NULL,
      category        TEXT NOT NULL,
      is_popular      INTEGER DEFAULT 0,
      fields_schema   TEXT NOT NULL,              -- JSON: field definitions
      base_text       TEXT NOT NULL,              -- Template text with {{placeholders}}
      sort_order      INTEGER DEFAULT 0,
      active          INTEGER DEFAULT 1,
      created_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      template_id     TEXT NOT NULL,
      title           TEXT NOT NULL,
      status          TEXT DEFAULT 'draft',       -- draft | generated | finalized
      form_data       TEXT NOT NULL,              -- JSON: filled form values
      generated_text  TEXT DEFAULT NULL,           -- AI-processed contract text
      ai_notes        TEXT DEFAULT NULL,           -- JSON: AI legal footnotes
      pdf_path        TEXT DEFAULT NULL,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (template_id) REFERENCES contract_templates(id)
    );

    CREATE TABLE IF NOT EXISTS contract_versions (
      id              TEXT PRIMARY KEY,
      contract_id     TEXT NOT NULL,
      version_number  INTEGER NOT NULL,
      generated_text  TEXT NOT NULL,
      ai_notes        TEXT DEFAULT NULL,
      created_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      stripe_payment_id TEXT DEFAULT NULL,
      plan            TEXT NOT NULL,
      amount_try      INTEGER NOT NULL,           -- Amount in kuruş (cents)
      status          TEXT DEFAULT 'pending',     -- pending | completed | failed | refunded
      created_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id);
    CREATE INDEX IF NOT EXISTS idx_contracts_template ON contracts(template_id);
    CREATE INDEX IF NOT EXISTS idx_versions_contract ON contract_versions(contract_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
  `);
}

// ── Query Helpers ────────────────────────────────────────────

// Users
const userQueries = {
  create: (db) => db.prepare(`
    INSERT INTO users (id, email, password_hash, name, plan, contracts_left)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  findByEmail: (db) => db.prepare(`SELECT * FROM users WHERE email = ?`),
  findById: (db) => db.prepare(`SELECT * FROM users WHERE id = ?`),
  updatePlan: (db) => db.prepare(`
    UPDATE users SET plan = ?, contracts_left = ?, updated_at = datetime('now') WHERE id = ?
  `),
  decrementContracts: (db) => db.prepare(`
    UPDATE users SET contracts_left = contracts_left - 1, updated_at = datetime('now')
    WHERE id = ? AND contracts_left > 0
  `),
};

// Templates
const templateQueries = {
  getAll: (db) => db.prepare(`
    SELECT * FROM contract_templates WHERE active = 1 ORDER BY sort_order ASC
  `),
  getById: (db) => db.prepare(`SELECT * FROM contract_templates WHERE id = ?`),
  upsert: (db) => db.prepare(`
    INSERT OR IGNORE INTO contract_templates (id, title, icon, description, category, is_popular, fields_schema, base_text, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  forceUpdate: (db) => db.prepare(`
    UPDATE contract_templates
    SET title=?, icon=?, description=?, category=?, is_popular=?, fields_schema=?, base_text=?, sort_order=?
    WHERE id=?
  `),
};

// Contracts
const contractQueries = {
  create: (db) => db.prepare(`
    INSERT INTO contracts (id, user_id, template_id, title, status, form_data, generated_text, ai_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findById: (db) => db.prepare(`
    SELECT c.*, ct.title as template_title, ct.icon as template_icon
    FROM contracts c
    LEFT JOIN contract_templates ct ON c.template_id = ct.id
    WHERE c.id = ?
  `),
  findByUser: (db) => db.prepare(`
    SELECT c.*, ct.title as template_title, ct.icon as template_icon
    FROM contracts c
    JOIN contract_templates ct ON c.template_id = ct.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `),
  update: (db) => db.prepare(`
    UPDATE contracts SET generated_text = ?, ai_notes = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `),
  setPdfPath: (db) => db.prepare(`
    UPDATE contracts SET pdf_path = ?, updated_at = datetime('now') WHERE id = ?
  `),
};

// Versions
const versionQueries = {
  create: (db) => db.prepare(`
    INSERT INTO contract_versions (id, contract_id, version_number, generated_text, ai_notes)
    VALUES (?, ?, ?, ?, ?)
  `),
  findByContract: (db) => db.prepare(`
    SELECT * FROM contract_versions WHERE contract_id = ? ORDER BY version_number DESC
  `),
  getLatestVersion: (db) => db.prepare(`
    SELECT MAX(version_number) as latest FROM contract_versions WHERE contract_id = ?
  `),
};

// Payments
const paymentQueries = {
  create: (db) => db.prepare(`
    INSERT INTO payments (id, user_id, stripe_payment_id, plan, amount_try, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  findByUser: (db) => db.prepare(`
    SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC
  `),
  updateStatus: (db) => db.prepare(`
    UPDATE payments SET status = ?, stripe_payment_id = ? WHERE id = ?
  `),
};

module.exports = {
  getDb,
  userQueries,
  templateQueries,
  contractQueries,
  versionQueries,
  paymentQueries,
};
