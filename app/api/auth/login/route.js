// ═══════════════════════════════════════════════════════════════
// POST /api/auth/login — User Login
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { getDb, userQueries } = require('@/lib/db');
const { verifyPassword, signToken, createAuthCookie, validateEmail } = require('@/lib/auth');

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir.' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
    }

    const db = getDb();
    const user = userQueries.findByEmail(db).get(email.toLowerCase().trim());

    if (!user) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    const { password_hash, ...safeUser } = user;

    const response = NextResponse.json({ user: safeUser, token });
    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;

  } catch (err) {
    console.error('[Login]', err);
    return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu.' }, { status: 500 });
  }
}
