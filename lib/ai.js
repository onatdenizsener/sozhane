// ═══════════════════════════════════════════════════════════════
// lib/ai.js — Anthropic API Integration (Contract AI Layer)
// ═══════════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// ── Template Placeholder Engine ──────────────────────────────
function fillTemplate(baseText, formData) {
  let text = baseText;

  // Replace all {{placeholder}} with form values
  Object.entries(formData).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    text = text.replace(regex, value || '[Belirtilmedi]');
  });

  // Handle conditional penalty clause
  if (formData.penalty_amount && Number(formData.penalty_amount) > 0) {
    const formatted = Number(formData.penalty_amount).toLocaleString('tr-TR');
    text = text.replace(
      '{{penalty_clause}}',
      `Gizlilik yükümlülüğünün ihlali halinde, ihlal eden taraf ${formatted} TL cezai şart ödeyecektir. Cezai şart, uğranılan gerçek zararın tazmini talebini engellemez (TBK m. 180).`
    );
  } else {
    text = text.replace(
      '{{penalty_clause}}',
      'Gizlilik yükümlülüğünün ihlali halinde, ihlal eden taraf diğer tarafın uğradığı doğrudan ve dolaylı zararları tazmin edecektir.'
    );
  }

  // Handle special clauses section
  if (formData.special_clauses && formData.special_clauses.trim()) {
    text = text.replace(
      '{{special_clauses_section}}',
      `\nEK MADDELER\n\n${formData.special_clauses}\n`
    );
  } else {
    text = text.replace('{{special_clauses_section}}', '');
  }

  // Handle duration text
  if (formData.duration_months) {
    const months = Number(formData.duration_months);
    const textMap = {
      1: 'bir', 2: 'iki', 3: 'üç', 6: 'altı', 12: 'on iki',
      18: 'on sekiz', 24: 'yirmi dört', 36: 'otuz altı', 48: 'kırk sekiz', 60: 'altmış'
    };
    text = text.replace('{{duration_months_text}}', textMap[months] || String(months));
  }

  // Handle partnership capital calculations
  if (formData.initial_capital && formData.partner1_share) {
    const cap = Number(formData.initial_capital);
    const s1 = Number(formData.partner1_share);
    const s2 = Number(formData.partner2_share || (100 - s1));
    text = text.replace('{{partner1_capital}}', Math.round(cap * s1 / 100).toLocaleString('tr-TR'));
    text = text.replace('{{partner2_capital}}', Math.round(cap * s2 / 100).toLocaleString('tr-TR'));
  }

  // Clean up any remaining unreplaced placeholders
  text = text.replace(/\{\{[^}]+\}\}/g, '');

  return text;
}

// ── AI Contract Refinement ───────────────────────────────────
async function refineContract(baseText, formData, templateTitle) {
  const filledText = fillTemplate(baseText, formData);

  // If no API key, return template as-is with generic notes
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'sk-ant-xxxxx') {
    return {
      contract: filledText,
      notes: [
        {
          title: 'Standart Şablon Kullanıldı',
          note: 'AI düzenleme servisi yapılandırılmamış. Sözleşmeniz, 6098 sayılı TBK ve ilgili mevzuata uygun standart şablonumuz ile oluşturuldu.'
        },
        {
          title: 'Öneri: Avukat Kontrolü',
          note: 'Yüksek tutarlı veya karmaşık sözleşmeleriniz için bir avukatın incelemesini öneririz.'
        }
      ],
    };
  }

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: `Sen deneyimli bir Türk hukuku uzmanısın. Görevin, kullanıcıların hazırladığı sözleşmeleri Türk hukukuna tam uyumlu hale getirmektir.

KURALLAR:
- 6098 sayılı Türk Borçlar Kanunu (TBK) başta olmak üzere ilgili mevzuata referans ver.
- Zayıf veya eksik maddeleri güçlendir.
- Hukuki terminolojiyi düzelt ve tutarlı hale getir.
- Tarafların haklarını dengeli koru.
- Her değişiklik için kısa, anlaşılır bir hukuki dipnot hazırla.
- Sözleşmenin genel yapısını ve formatını koru.
- Madde numaralandırmasını düzgün tut.

YASAL UYARI: Bu bir avukatlık hizmeti değildir. Genel bilgilendirme amaçlıdır.

YANIT FORMATI: Yalnızca JSON döndür, başka hiçbir şey yazma (markdown backtick dahil).
Format: {"contract": "tam düzenlenmiş sözleşme metni", "notes": [{"title": "kısa başlık", "note": "hukuki açıklama"}]}`,
        messages: [
          {
            role: 'user',
            content: `Aşağıdaki "${templateTitle}" şablonunu incele ve Türk hukukuna uygun şekilde düzenle. Eksik veya zayıf maddeleri güçlendir, her değişikliğin hukuki gerekçesini dipnot olarak belirt.

SÖZLEŞME METNİ:
${filledText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[AI] API error:', response.status, err);
      return { contract: filledText, notes: [{ title: 'AI Hatası', note: 'Düzenleme servisi geçici olarak kullanılamıyor. Standart şablon kullanıldı.' }] };
    }

    const result = await response.json();
    const rawText = result.content?.map(b => b.text || '').join('') || '';
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        contract: parsed.contract || filledText,
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      };
    } catch (parseErr) {
      console.error('[AI] JSON parse error:', parseErr.message);
      // If AI returned text but not valid JSON, use the filled template
      return {
        contract: filledText,
        notes: [{ title: 'Kısmi Düzenleme', note: 'AI yanıtı işlenemedi. Standart şablon ile devam edildi.' }],
      };
    }
  } catch (err) {
    console.error('[AI] Network error:', err.message);
    return {
      contract: filledText,
      notes: [{ title: 'Bağlantı Hatası', note: 'AI servisine erişilemedi. Standart şablon kullanıldı. Lütfen tekrar deneyin.' }],
    };
  }
}

module.exports = {
  fillTemplate,
  refineContract,
};
