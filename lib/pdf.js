// ═══════════════════════════════════════════════════════════════
// lib/pdf.js — PDF Generation (Puppeteer)
// ═══════════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PDF_DIR = process.env.PDF_DIR || path.join(process.cwd(), 'generated-pdfs');

// Ensure output directory exists
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

// ── Chromium Launch Options (centralized) ────────────────────
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getLaunchOptions() {
  const opts = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
      '--single-process',
    ],
  };

  // Production: MUST use system Chromium
  if (IS_PRODUCTION) {
    if (!fs.existsSync(CHROMIUM_PATH)) {
      throw new Error(`System Chromium not found at ${CHROMIUM_PATH}. Docker image'ı kontrol edin.`);
    }
    opts.executablePath = CHROMIUM_PATH;
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    // Dev: use system Chromium if env var is set
    opts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  // Dev without env var: Puppeteer uses its bundled Chromium

  return opts;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function buildContractHtml({ contractText, aiNotes, logoBase64, templateTitle }) {
  const notesHtml = (aiNotes || []).map(n => `
    <div class="ai-note">
      <div class="ai-note-title">${escapeHtml(n.title)}</div>
      <div class="ai-note-body">${escapeHtml(n.note)}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Noto+Sans:wght@400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: A4;
    margin: 28mm 24mm 28mm 24mm;
  }

  body {
    font-family: 'Noto Sans', 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #D4A853;
  }

  .logo { max-height: 56px; max-width: 200px; }

  .header-meta {
    text-align: right;
    font-size: 9pt;
    color: #666;
  }

  .contract-body {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 11pt;
    line-height: 1.75;
  }

  .ai-notes-section {
    margin-top: 36px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    page-break-before: auto;
  }

  .ai-notes-title {
    font-family: 'Noto Serif', Georgia, serif;
    font-size: 13pt;
    font-weight: 700;
    color: #333;
    margin-bottom: 12px;
  }

  .ai-note {
    background: #FFFBE6;
    border-left: 3px solid #D4A853;
    padding: 10px 14px;
    margin-bottom: 10px;
    border-radius: 0 4px 4px 0;
    page-break-inside: avoid;
  }

  .ai-note-title {
    font-weight: 600;
    font-size: 10pt;
    color: #8B6914;
    margin-bottom: 3px;
  }

  .ai-note-body {
    font-size: 9.5pt;
    color: #555;
    line-height: 1.6;
  }

  .disclaimer {
    margin-top: 40px;
    padding: 14px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 8.5pt;
    color: #888;
    line-height: 1.5;
    page-break-inside: avoid;
  }

  .disclaimer strong { color: #666; }

  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 8pt;
    color: #aaa;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : `<div style="font-family: 'Noto Serif', serif; font-size: 14pt; font-weight: 700; color: #D4A853;">Sözhane</div>`}
  </div>
  <div class="header-meta">
    ${templateTitle || 'Sözleşme'}<br>
    Tarih: ${new Date().toLocaleDateString('tr-TR')}
  </div>
</div>

<div class="contract-body">${escapeHtml(contractText)}</div>

${notesHtml ? `
<div class="ai-notes-section">
  <div class="ai-notes-title">📝 AI Hukuki Dipnotlar</div>
  ${notesHtml}
</div>
` : ''}

<div class="disclaimer">
  <strong>⚖️ Yasal Uyarı:</strong> Bu belge Sözhane platformu aracılığıyla oluşturulmuş olup, avukatlık hizmeti niteliği taşımamaktadır.
  1136 sayılı Avukatlık Kanunu kapsamında hukuki danışmanlık veya avukatlık hizmeti sunulmamaktadır.
  Sözleşmenin hukuki sorumluluğu tamamen kullanıcıya aittir. Yüksek tutarlı ve kritik hukuki işlemleriniz için
  mutlaka bir avukata danışmanız önerilir.
</div>

<div class="footer">
  Sözhane — Türkçe Hukuki Sözleşme Otomasyonu | sozhane.com
</div>

</body>
</html>`;
}

async function generatePdf({ contractId, contractText, aiNotes, logoBase64, templateTitle }) {
  const html = buildContractHtml({ contractText, aiNotes, logoBase64, templateTitle });

  let browser;
  try {
    browser = await puppeteer.launch(getLaunchOptions());

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

    const filename = `sozhane-${contractId}-${Date.now()}.pdf`;
    const filepath = path.join(PDF_DIR, filename);

    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: { top: '28mm', right: '24mm', bottom: '28mm', left: '24mm' },
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    });

    return { filepath, filename };
  } finally {
    if (browser) await browser.close();
  }
}

// Generate PDF as buffer (for streaming response)
async function generatePdfBuffer({ contractText, aiNotes, logoBase64, templateTitle }) {
  const html = buildContractHtml({ contractText, aiNotes, logoBase64, templateTitle });

  let browser;
  try {
    browser = await puppeteer.launch(getLaunchOptions());

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '28mm', right: '24mm', bottom: '28mm', left: '24mm' },
    });

    return buffer;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  generatePdf,
  generatePdfBuffer,
  buildContractHtml,
};
