// ═══════════════════════════════════════════════════════════════
// POST /api/pdf/generate — Generate PDF from Contract
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { getDb, contractQueries } = require('@/lib/db');
const { authenticateRequest } = require('@/lib/auth');
const { generatePdfBuffer } = require('@/lib/pdf');

export async function POST(request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contract_id, contract_text, ai_notes, logo_base64, template_title } = body;

    let text = contract_text;
    let notes = ai_notes || [];
    let title = template_title || 'Sözleşme';

    // If contract_id provided, load from DB
    if (contract_id && !contract_text) {
      const db = getDb();
      const contract = contractQueries.findById(db).get(contract_id);

      if (!contract) {
        return NextResponse.json({ error: 'Sözleşme bulunamadı.' }, { status: 404 });
      }
      if (contract.user_id !== user.id) {
        return NextResponse.json({ error: 'Erişim yetkiniz yok.' }, { status: 403 });
      }

      text = contract.generated_text;
      notes = JSON.parse(contract.ai_notes || '[]');
    }

    if (!text) {
      return NextResponse.json({ error: 'Sözleşme metni gerekli.' }, { status: 400 });
    }

    // Generate PDF
    const pdfBuffer = await generatePdfBuffer({
      contractText: text,
      aiNotes: notes,
      logoBase64: logo_base64 || null,
      templateTitle: title,
    });

    // Return as downloadable PDF
    const filename = `sozhane-sozlesme-${Date.now()}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (err) {
    console.error('[PDF Generate]', err);
    return NextResponse.json({ error: 'PDF oluşturulamadı.' }, { status: 500 });
  }
}
