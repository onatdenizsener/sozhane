// ═══════════════════════════════════════════════════════════════
// GET /api/auth/me — Get Current User
// DELETE /api/auth/me — Logout
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { authenticateRequest, clearAuthCookie } = require('@/lib/auth');

export async function GET(request) {
  const user = authenticateRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function DELETE(request) {
  const response = NextResponse.json({ message: 'Çıkış yapıldı.' });
  response.headers.set('Set-Cookie', clearAuthCookie());
  return response;
}
