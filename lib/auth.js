// ═══════════════════════════════════════════════════════════════
// lib/auth.js — Authentication Layer (JWT + bcrypt)
// ═══════════════════════════════════════════════════════════════

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, userQueries } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'sozhane-dev-secret-2026';
const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

// ── Password Hashing ─────────────────────────────────────────
async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── JWT ──────────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ── Auth Middleware (for API routes) ─────────────────────────
function getTokenFromRequest(request) {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookie
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/sozhane_token=([^;]+)/);
  return match ? match[1] : null;
}

function authenticateRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const db = getDb();
  const user = userQueries.findById(db).get(payload.userId);
  if (!user) return null;

  // Strip password hash from returned user
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// ── Cookie Helper ────────────────────────────────────────────
function createAuthCookie(token) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `sozhane_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearAuthCookie() {
  return `sozhane_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ── Validation ───────────────────────────────────────────────
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Şifre en az 6 karakter olmalıdır.' };
  }
  return { valid: true };
}

function validateRegistration({ email, password, name }) {
  const errors = [];
  if (!name?.trim()) errors.push('Ad soyad gereklidir.');
  if (!email?.trim()) errors.push('E-posta gereklidir.');
  else if (!validateEmail(email)) errors.push('Geçerli bir e-posta adresi girin.');
  const pw = validatePassword(password);
  if (!pw.valid) errors.push(pw.error);
  return errors;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authenticateRequest,
  createAuthCookie,
  clearAuthCookie,
  validateEmail,
  validatePassword,
  validateRegistration,
};
