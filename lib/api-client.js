// ═══════════════════════════════════════════════════════════════
// lib/api-client.js — Frontend API Client (runs in browser)
// ═══════════════════════════════════════════════════════════════

const BASE = '';

async function request(path, options = {}) {
  const { body, method = 'GET', token } = options;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle PDF (binary response)
  if (res.headers.get('content-type')?.includes('application/pdf')) {
    const blob = await res.blob();
    return { ok: true, blob };
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Bir hata oluştu.');
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export async function register({ email, password, name }) {
  return request('/api/auth/register', { method: 'POST', body: { email, password, name } });
}

export async function login({ email, password }) {
  return request('/api/auth/login', { method: 'POST', body: { email, password } });
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function logout() {
  return request('/api/auth/me', { method: 'DELETE' });
}

// ── Templates ────────────────────────────────────────────────
export async function getTemplates() {
  return request('/api/templates');
}

// ── Contracts ────────────────────────────────────────────────
export async function getContracts() {
  return request('/api/contracts');
}

export async function createContract({ template_id, form_data }) {
  return request('/api/contracts', { method: 'POST', body: { template_id, form_data } });
}

export async function getContract(id) {
  return request(`/api/contracts/${id}`);
}

// ── AI ───────────────────────────────────────────────────────
export async function generateAI({ template_id, form_data, skip_ai = false }) {
  return request('/api/ai/generate', { method: 'POST', body: { template_id, form_data, skip_ai } });
}

// ── PDF ──────────────────────────────────────────────────────
export async function generatePdf({ contract_id, contract_text, ai_notes, logo_base64, template_title }) {
  const res = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ contract_id, contract_text, ai_notes, logo_base64, template_title }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'PDF oluşturulamadı.');
  }

  const blob = await res.blob();
  return blob;
}

// ── Payments ─────────────────────────────────────────────────
export async function activatePlan(plan) {
  const data = await request('/api/payments', { method: 'POST', body: { plan } });

  // If Stripe returns a checkout URL, redirect to it
  if (data.checkout_url) {
    window.location.href = data.checkout_url;
    return { redirected: true };
  }

  // Direct activation (no Stripe configured)
  return data;
}

export async function getPaymentHistory() {
  return request('/api/payments');
}

// ── Download helper ──────────────────────────────────────────
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
