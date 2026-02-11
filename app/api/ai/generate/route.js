// ═══════════════════════════════════════════════════════════════
// POST /api/ai/generate — Generate/Refine Contract Text
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { getDb, templateQueries } = require('@/lib/db');
const { authenticateRequest } = require('@/lib/auth');
const { refineContract, fillTemplate } = require('@/lib/ai');

export async function POST(request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template_id, form_data, skip_ai } = body;

    if (!template_id || !form_data) {
      return NextResponse.json({ error: 'Şablon ve form verisi gerekli.' }, { status: 400 });
    }

    const db = getDb();
    const template = templateQueries.getById(db).get(template_id);

    if (!template) {
      return NextResponse.json({ error: 'Şablon bulunamadı.' }, { status: 404 });
    }

    // If skip_ai, just fill template without AI refinement
    if (skip_ai) {
      const filledText = fillTemplate(template.base_text, form_data);
      return NextResponse.json({
        contract: filledText,
        notes: [],
        ai_used: false,
      });
    }

    // Full AI refinement
    const result = await refineContract(template.base_text, form_data, template.title);

    return NextResponse.json({
      contract: result.contract,
      notes: result.notes,
      ai_used: true,
    });

  } catch (err) {
    console.error('[AI Generate]', err);
    return NextResponse.json({ error: 'Sözleşme oluşturulamadı.' }, { status: 500 });
  }
}
