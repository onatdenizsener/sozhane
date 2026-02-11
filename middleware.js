// ═══════════════════════════════════════════════════════════════
// middleware.js — Route Protection
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/contracts',
  '/api/ai/generate',
  '/api/pdf/generate',
  '/api/payments',
];

// Public API routes
const PUBLIC_API_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/templates',
  '/api/payments/webhook',
  '/api/health',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip non-API routes (handled by client-side routing)
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('sozhane_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum gerekli. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
