// ═══════════════════════════════════════════════════════════════
// lib/stripe.js — Stripe Payment Integration
// ═══════════════════════════════════════════════════════════════

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ── Plans ────────────────────────────────────────────────────
const PLANS = {
  starter: {
    id: 'starter',
    name: 'Başlangıç',
    price_try: 19900,       // kuruş
    contracts: 5,
    mode: 'payment',        // tek seferlik
    stripe_price_id: process.env.STRIPE_PRICE_ONE_TIME_TRY || null,
  },
  pro: {
    id: 'pro',
    name: 'Profesyonel',
    price_try: 4900,        // kuruş / ay
    contracts: 9999,
    mode: 'subscription',   // aylık
    stripe_price_id: process.env.STRIPE_PRICE_SUB_MONTHLY_TRY || null,
  },
};

// ── Stripe API Helper ────────────────────────────────────────
async function stripeRequest(endpoint, body) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Stripe API hatası');
  }
  return data;
}

async function stripeGet(endpoint) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET}` },
  });
  return res.json();
}

// ── Customer ─────────────────────────────────────────────────
async function findOrCreateCustomer(email, name) {
  // Search existing
  const search = await stripeGet(`/customers?email=${encodeURIComponent(email)}&limit=1`);
  if (search.data?.length > 0) {
    return search.data[0];
  }

  // Create new
  return stripeRequest('/customers', { email, name });
}

// ── Checkout Session ─────────────────────────────────────────
async function createCheckoutSession({ userId, email, name, planId }) {
  const plan = PLANS[planId];
  if (!plan) throw new Error('Geçersiz plan');

  if (!STRIPE_SECRET || STRIPE_SECRET === 'sk_test_xxxxx') {
    throw new Error('STRIPE_SECRET_KEY yapılandırılmamış');
  }

  const customer = await findOrCreateCustomer(email, name);

  const params = {
    'customer': customer.id,
    'mode': plan.mode,
    'success_url': `${APP_URL}/#/dashboard?payment=success&plan=${planId}`,
    'cancel_url': `${APP_URL}/#/pricing?payment=cancelled`,
    'metadata[user_id]': userId,
    'metadata[plan_id]': planId,
    'allow_promotion_codes': 'true',
    'billing_address_collection': 'required',
    'locale': 'tr',
  };

  if (plan.stripe_price_id) {
    // Use pre-configured Stripe Price
    params['line_items[0][price]'] = plan.stripe_price_id;
    params['line_items[0][quantity]'] = '1';
  } else {
    // Create price on the fly (for development)
    params['line_items[0][price_data][currency]'] = 'try';
    params['line_items[0][price_data][unit_amount]'] = String(plan.price_try);
    params['line_items[0][price_data][product_data][name]'] = `Sözhane ${plan.name} Plan`;
    params['line_items[0][price_data][product_data][description]'] = planId === 'starter'
      ? '5 sözleşme hakkı, AI düzenleme, PDF indirme'
      : 'Sınırsız sözleşme, AI düzenleme, PDF indirme, öncelikli destek';
    params['line_items[0][quantity]'] = '1';

    if (plan.mode === 'subscription') {
      params['line_items[0][price_data][recurring][interval]'] = 'month';
    }
  }

  return stripeRequest('/checkout/sessions', params);
}

// ── Webhook Signature Verification ───────────────────────────
function verifyWebhookSignature(payload, signature) {
  if (!STRIPE_WEBHOOK_SECRET) return true; // Skip in dev

  const crypto = require('crypto');
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {});

  const timestamp = parts.t;
  const sig = parts.v1;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  return sig === expected;
}

// ── Customer Portal ──────────────────────────────────────────
async function createPortalSession(customerId) {
  if (!STRIPE_SECRET || STRIPE_SECRET === 'sk_test_xxxxx') return null;

  return stripeRequest('/billing_portal/sessions', {
    customer: customerId,
    return_url: `${APP_URL}/#/dashboard`,
  });
}

module.exports = {
  PLANS,
  createCheckoutSession,
  verifyWebhookSignature,
  createPortalSession,
  findOrCreateCustomer,
};
