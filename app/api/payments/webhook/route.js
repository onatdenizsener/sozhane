// ═══════════════════════════════════════════════════════════════
// POST /api/payments/webhook — Stripe Webhook Handler
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { getDb, userQueries, paymentQueries } = require('@/lib/db');
const { PLANS, verifyWebhookSignature } = require('@/lib/stripe');

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Verify webhook signature
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (!userId || !planId) {
          console.error('[Webhook] Missing metadata:', session.id);
          break;
        }

        const plan = PLANS[planId];
        if (!plan) {
          console.error('[Webhook] Invalid plan:', planId);
          break;
        }

        const db = getDb();

        // Update payment status
        const payments = db.prepare(
          `SELECT id FROM payments WHERE stripe_payment_id = ? LIMIT 1`
        ).get(session.id);

        if (payments) {
          paymentQueries.updateStatus(db).run('completed', session.payment_intent || session.id, payments.id);
        }

        // Activate plan for user
        userQueries.updatePlan(db).run(planId, plan.contracts, userId);

        // Store Stripe customer ID
        if (session.customer) {
          db.prepare(`UPDATE users SET stripe_customer_id = ? WHERE id = ?`).run(session.customer, userId);
        }

        console.log(`[Webhook] Plan activated: ${userId} → ${planId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled — downgrade user
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const db = getDb();
        const user = db.prepare(
          `SELECT id FROM users WHERE stripe_customer_id = ? LIMIT 1`
        ).get(customerId);

        if (user) {
          userQueries.updatePlan(db).run(null, 0, user.id);
          console.log(`[Webhook] Subscription cancelled: ${user.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`[Webhook] Payment failed: ${invoice.customer}`);
        // Could send email notification here
        break;
      }

      default:
        // Unhandled event type — acknowledge
        break;
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Disable body parsing so we can verify the raw signature
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

