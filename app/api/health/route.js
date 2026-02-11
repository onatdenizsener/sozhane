// GET /api/health — Health Check
import { NextResponse } from 'next/server';

const { getDb } = require('@/lib/db');

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM contract_templates').get();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: result.count > 0 ? 'connected' : 'empty',
      templates: result.count,
      version: '1.0.0',
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      error: err.message,
    }, { status: 500 });
  }
}
