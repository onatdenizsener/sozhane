// ═══════════════════════════════════════════════════════════════
// GET  /api/contracts — List User's Contracts
// POST /api/contracts — Create Contract (+ AI Refinement)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { v4: uuid } = require('uuid');
const { getDb, contractQueries, templateQueries, userQueries, versionQueries } = require('@/lib/db');
const { authenticateRequest } = require('@/lib/auth');
const { refineContract } = require('@/lib/ai');

// ── GET: List contracts ──────────────────────────────────────
export async function GET(request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const db = getDb();
    const contracts = contractQueries.findByUser(db).all(user.id);

    return NextResponse.json({
      contracts: contracts.map(c => ({
        ...c,
        form_data: JSON.parse(c.form_data || '{}'),
        ai_notes: JSON.parse(c.ai_notes || '[]'),
      })),
    });
  } catch (err) {
    console.error('[Contracts GET]', err);
    return NextResponse.json({ error: 'Sözleşmeler yüklenemedi.' }, { status: 500 });
  }
}

// ── POST: Create new contract with AI ────────────────────────
export async function POST(request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template_id, form_data } = body;

    if (!template_id || !form_data) {
      return NextResponse.json({ error: 'Şablon ve form verisi gerekli.' }, { status: 400 });
    }

    // Check plan limits
    if (!user.plan) {
      return NextResponse.json({ error: 'Sözleşme oluşturmak için bir plan satın almalısınız.' }, { status: 403 });
    }

    if (user.plan === 'starter' && user.contracts_left <= 0) {
      return NextResponse.json({ error: 'Sözleşme hakkınız kalmadı. Pro plana yükseltin.' }, { status: 403 });
    }

    const db = getDb();

    // Get template
    const template = templateQueries.getById(db).get(template_id);
    if (!template) {
      return NextResponse.json({ error: 'Şablon bulunamadı.' }, { status: 404 });
    }

    // Validate required fields
    const fieldsSchema = JSON.parse(template.fields_schema);
    const missingFields = fieldsSchema
      .filter(f => f.required && (!form_data[f.id] || !String(form_data[f.id]).trim()))
      .map(f => f.label);

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Zorunlu alanlar eksik: ${missingFields.join(', ')}`,
        missing_fields: missingFields,
      }, { status: 400 });
    }

    // AI refinement
    const aiResult = await refineContract(template.base_text, form_data, template.title);

    // Create contract record
    const contractId = uuid();
    const title = generateContractTitle(template, form_data);

    contractQueries.create(db).run(
      contractId,
      user.id,
      template_id,
      title,
      'generated',
      JSON.stringify(form_data),
      aiResult.contract,
      JSON.stringify(aiResult.notes),
    );

    // Save as version 1
    versionQueries.create(db).run(
      uuid(),
      contractId,
      1,
      aiResult.contract,
      JSON.stringify(aiResult.notes),
    );

    // Decrement contract count for starter plan
    if (user.plan === 'starter') {
      userQueries.decrementContracts(db).run(user.id);
    }

    // Return the created contract
    const contract = contractQueries.findById(db).get(contractId);

    return NextResponse.json({
      contract: {
        ...contract,
        form_data: JSON.parse(contract.form_data),
        ai_notes: JSON.parse(contract.ai_notes || '[]'),
      },
    }, { status: 201 });

  } catch (err) {
    console.error('[Contracts POST]', err);
    return NextResponse.json({ error: 'Sözleşme oluşturulamadı.' }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────
function generateContractTitle(template, formData) {
  const fieldsSchema = JSON.parse(template.fields_schema);
  const firstField = fieldsSchema[0];
  const firstValue = formData[firstField?.id] || '';

  // Try to get a meaningful name from the party fields
  const partyFields = fieldsSchema.filter(f =>
    f.id.includes('name') && !f.id.includes('partnership')
  );

  if (partyFields.length >= 2) {
    const p1 = formData[partyFields[0].id] || '';
    const p2 = formData[partyFields[1].id] || '';
    if (p1 && p2) return `${p1} ↔ ${p2}`;
  }

  return firstValue ? `${firstValue} - ${template.title}` : template.title;
}
