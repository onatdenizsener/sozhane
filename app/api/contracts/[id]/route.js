// ═══════════════════════════════════════════════════════════════
// GET /api/contracts/[id] — Get Single Contract
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { getDb, contractQueries, versionQueries } = require('@/lib/db');
const { authenticateRequest } = require('@/lib/auth');

export async function GET(request, { params }) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const db = getDb();

    const contract = contractQueries.findById(db).get(id);
    if (!contract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı.' }, { status: 404 });
    }

    // Ownership check
    if (contract.user_id !== user.id) {
      return NextResponse.json({ error: 'Bu sözleşmeye erişim yetkiniz yok.' }, { status: 403 });
    }

    // Get versions
    const versions = versionQueries.findByContract(db).all(id);

    return NextResponse.json({
      contract: {
        ...contract,
        form_data: JSON.parse(contract.form_data || '{}'),
        ai_notes: JSON.parse(contract.ai_notes || '[]'),
      },
      versions: versions.map(v => ({
        ...v,
        ai_notes: JSON.parse(v.ai_notes || '[]'),
      })),
    });

  } catch (err) {
    console.error('[Contract GET]', err);
    return NextResponse.json({ error: 'Sözleşme yüklenemedi.' }, { status: 500 });
  }
}
