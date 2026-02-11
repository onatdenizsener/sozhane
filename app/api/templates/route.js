// ═══════════════════════════════════════════════════════════════
// GET /api/templates — List All Active Templates
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const { getDb, templateQueries } = require('@/lib/db');

export async function GET() {
  try {
    const db = getDb();
    const rows = templateQueries.getAll(db).all();

    const templates = rows.map(r => ({
      id: r.id,
      title: r.title,
      icon: r.icon,
      description: r.description,
      category: r.category,
      is_popular: !!r.is_popular,
      fields_schema: JSON.parse(r.fields_schema),
      // base_text intentionally omitted from list (returned on individual fetch)
    }));

    return NextResponse.json({ templates });
  } catch (err) {
    console.error('[Templates]', err);
    return NextResponse.json({ error: 'Şablonlar yüklenemedi.' }, { status: 500 });
  }
}
