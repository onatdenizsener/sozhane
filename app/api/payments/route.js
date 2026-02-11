// ═══════════════════════════════════════════════════════════════
// POST /api/payments — Create Stripe Checkout or Direct Activate
// GET  /api/payments — Payment History
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { v4: uuid } = require('uuid');
const { getDb, userQueries, paymentQueries } = require('@/lib/db');
const { authenticateRequest } = require('@/lib/auth');
const { PLANS, createCheckoutSession } = require('@/lib/stripe');

// ── POST: Checkout or Direct Activate ────────────────────────
export async function POST(request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { plan: planId } = body;

    if (!['starter', 'pro'].includes(planId)) {
      return NextResponse.json({ error: 'Geçersiz plan.' }, { status: 400 });
    }

    const plan = PLANS[planId];
    const isProduction = process.env.NODE_ENV === 'production';

    // ── Stripe Checkout ──────────────────────────────────────
    try {
      const session = await createCheckoutSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        planId,
      });

      if (session) {
        const db = getDb();
        const paymentId = uuid();

        paymentQueries.create(db).run(
          paymentId, user.id, session.id, planId, plan.price_try, 'pending',
        );

        return NextResponse.json({
          checkout_url: session.url,
          session_id: session.id,
          payment_id: paymentId,
        });
      }
    } catch (stripeErr) {
      console.error('[Payment] Stripe error:', stripeErr.message);

      // PRODUCTION: Stripe zorunlu — hata dön
      if (isProduction) {
        return NextResponse.json({
          error: 'Ödeme sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
        }, { status: 503 });
      }
    }

    // ── Dev-only fallback: Direct activation (no Stripe keys) ──
    if (isProduction) {
      return NextResponse.json({
        error: 'Ödeme sistemi yapılandırılmamış. Stripe anahtarlarını kontrol edin.',
      }, { status: 503 });
    }

    console.warn('[Payment] DEV MODE: Direct activation (Stripe not configured)');

    const db = getDb();
    const paymentId = uuid();

    paymentQueries.create(db).run(
      paymentId, user.id, `dev_direct_${paymentId}`, planId, plan.price_try, 'completed',
    );

    userQueries.updatePlan(db).run(planId, plan.contracts, user.id);

    const updatedUser = userQueries.findById(db).get(user.id);
    const { password_hash, ...safeUser } = updatedUser;

    return NextResponse.json({
      activated: true,
      dev_mode: true,
      message: `[DEV] ${plan.name} planı aktifleştirildi (direkt aktivasyon)`,
      user: safeUser,
    });

  } catch (err) {
    console.error('[Payment]', err);
    return NextResponse.json({ error: 'Ödeme işlemi başarısız.' }, { status: 500 });
  }
}

// ── GET: Payment History ─────────────────────────────────────
export async function GET(request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const db = getDb();
    const payments = paymentQueries.findByUser(db).all(user.id);
    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json({ error: 'Ödemeler yüklenemedi.' }, { status: 500 });
  }
}
