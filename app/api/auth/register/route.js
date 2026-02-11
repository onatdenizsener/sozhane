// ═══════════════════════════════════════════════════════════════
// POST /api/auth/register — User Registration
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { v4: uuid } = require('uuid');
const { getDb, userQueries } = require('@/lib/db');
const { hashPassword, signToken, createAuthCookie, validateRegistration } = require('@/lib/auth');

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate
    const errors = validateRegistration({ email, password, name });
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const db = getDb();

    // Check if email exists
    const existing = userQueries.findByEmail(db).get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
    }

    // Create user
    const userId = uuid();
    const passwordHash = await hashPassword(password);

    userQueries.create(db).run(
      userId,
      email.toLowerCase().trim(),
      passwordHash,
      name.trim(),
      null, // plan
      0     // contracts_left
    );

    // Generate token
    const token = signToken({ userId, email: email.toLowerCase().trim() });

    // Set cookie + return user
    const response = NextResponse.json({
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        plan: null,
        contracts_left: 0,
      },
      token,
    }, { status: 201 });

    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;

  } catch (err) {
    console.error('[Register]', err);
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
  }
}
