'use client';

// ═══════════════════════════════════════════════════════════════
// SozhaneApp.jsx — Client-side SPA (Connected to Backend API)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '@/lib/api-client';

// ── Auth Context ─────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name) => {
    const data = await api.register({ email, password, name });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch { /* ignore */ }
  };

  return { user, setUser, loading, login, register, logout, refreshUser };
}

// ── Templates Context ────────────────────────────────────────
function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTemplates();
      setTemplates(data.templates);
    } catch (err) {
      console.error('Templates load error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { templates, loading };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Navbar({ page, setPage, user, onLogout }) {
  const isActive = (p) => page === p || (p === 'dashboard' && page === 'contracts');

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setPage(user ? 'dashboard' : 'landing')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center font-display font-extrabold text-brand-bg text-lg">S</div>
          <span className="font-display text-xl font-bold tracking-tight text-brand-text">Sözhane</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => setPage('dashboard')} className={`px-4 py-2 text-sm rounded-lg border font-body font-semibold transition-colors ${isActive('dashboard') ? 'border-brand-accent text-brand-accent bg-brand-elevated' : 'border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-accent/50'}`}>Sözleşmelerim</button>
              <button onClick={() => setPage('templates')} className="px-4 py-2 text-sm rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold hover:opacity-90 transition-opacity">+ Yeni Sözleşme</button>
              <div className="flex items-center gap-1 ml-1">
                <span className="text-xs text-brand-dim font-body hidden md:inline">{user.email}</span>
                <button onClick={onLogout} className="px-3 py-2 text-sm text-brand-muted hover:text-brand-text transition-colors font-body">Çıkış</button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setPage('pricing')} className={`px-4 py-2 text-sm hover:text-brand-text transition-colors font-body ${page === 'pricing' ? 'text-brand-accent' : 'text-brand-muted'}`}>Fiyatlar</button>
              <button onClick={() => setPage('login')} className="px-4 py-2 text-sm rounded-lg border border-brand-accent text-brand-accent hover:bg-brand-elevated transition-colors font-body font-semibold">Giriş Yap</button>
              <button onClick={() => setPage('register')} className="px-4 py-2 text-sm rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold">Ücretsiz Başla</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Landing ──────────────────────────────────────────────────
function Landing({ setPage }) {
  return (
    <div>
      <section className="pt-24 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="inline-block bg-brand-elevated border border-brand-border rounded-full px-4 py-1.5 text-xs text-brand-accent-light mb-6 font-body">🇹🇷 Türk Hukukuna Uygun • AI Destekli</div>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-brand-text leading-tight mb-5 tracking-tight">
            Sözleşmelerinizi<br /><span className="text-brand-accent">Dakikalar</span> İçinde Oluşturun
          </h1>
          <p className="font-body text-lg text-brand-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Avukata gitmeden, Türk hukukuna uygun profesyonel sözleşmeler hazırlayın. AI destekli düzenleme ile hukuki açıklamalar alın.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setPage('register')} className="px-8 py-4 text-base rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold hover:opacity-90 transition-opacity">Ücretsiz Dene →</button>
            <button onClick={() => setPage('pricing')} className="px-8 py-4 text-base rounded-lg border-2 border-brand-accent text-brand-accent font-body font-semibold hover:bg-brand-elevated transition-colors">Fiyatları Gör</button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: '📋', title: 'Hazır Şablonlar', desc: 'NDA, Hizmet, Freelance ve Ortaklık sözleşmeleri Türkçe hukuki standartlarda' },
            { icon: '🤖', title: 'AI Düzenleme', desc: 'Yapay zeka, maddeleri Türk hukukuna göre düzenler ve hukuki dipnotlarla açıklar' },
            { icon: '⚡', title: '5 Dakikada Hazır', desc: 'Formu doldurun, AI düzenlesin, PDF olarak indirin' },
            { icon: '🔒', title: 'Hukuki Güvence', desc: '6098 sayılı TBK ve ilgili mevzuata uygun, güncel hukuki terimlerle' },
          ].map((f, i) => (
            <div key={i} className="bg-brand-card border border-brand-border rounded-xl p-8 text-center hover:border-brand-accent/30 transition-colors">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display text-lg font-bold text-brand-text mb-2">{f.title}</h3>
              <p className="font-body text-sm text-brand-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 text-center">
            <p className="font-body text-sm text-yellow-400 font-semibold mb-2">⚖️ Yasal Uyarı</p>
            <p className="font-body text-sm text-brand-muted leading-relaxed">
              Sözhane bir avukatlık hizmeti sunmamaktadır. Oluşturulan sözleşmelerin hukuki sorumluluğu tamamen kullanıcıya aittir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Auth Form ────────────────────────────────────────────────
function AuthForm({ mode, setPage, authActions }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Tüm alanları doldurun.'); return; }
    if (mode === 'register' && !name) { setError('İsminizi girin.'); return; }

    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await authActions.login(email, password);
      } else {
        result = await authActions.register(email, password, name);
      }
      // Navigate based on plan status
      const hasActivePlan = result.user?.plan;
      setPage(hasActivePlan ? 'dashboard' : 'pricing');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const inputCls = 'w-full bg-brand-input border border-brand-border rounded-lg px-4 py-3 text-brand-text font-body text-sm outline-none focus:border-brand-accent transition-colors';

  return (
    <div className="py-20 px-6 flex justify-center">
      <div className="bg-brand-card border border-brand-border rounded-xl p-9 w-full max-w-md">
        <h2 className="font-display text-2xl font-bold text-brand-text text-center mb-2">
          {mode === 'login' ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
        </h2>
        <p className="font-body text-sm text-brand-muted text-center mb-7">
          {mode === 'login' ? 'Sözleşmelerinize erişmek için giriş yapın' : 'Hemen ücretsiz başlayın'}
        </p>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mb-4 text-sm text-red-400 font-body">{error}</div>}

        <div className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-body font-medium">Ad Soyad</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" className={inputCls} />
            </div>
          )}
          <div>
            <label className="block text-xs text-brand-muted mb-1.5 font-body font-medium">E-posta</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1.5 font-body font-medium">Şifre</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="En az 6 karakter" className={inputCls} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 mt-2 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>

        <p className="font-body text-sm text-brand-muted text-center mt-5">
          {mode === 'login' ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
          <span className="text-brand-accent cursor-pointer font-semibold" onClick={() => setPage(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Pricing ──────────────────────────────────────────────────
function Pricing({ setPage, user, refreshUser, setToast }) {
  const [loading, setLoading] = useState(null);

  const selectPlan = async (planId) => {
    if (!user) { setPage('register'); return; }
    if (user.plan === planId) return; // Already on this plan

    setLoading(planId);
    try {
      const result = await api.activatePlan(planId);

      // If redirected to Stripe, stop here (page will change)
      if (result.redirected) return;

      // Direct activation — refresh and navigate
      await refreshUser();
      setToast?.({ type: 'success', message: result.message || 'Plan aktifleştirildi!' });
      setPage('templates');
    } catch (err) {
      setToast?.({ type: 'error', message: err.message });
    }
    setLoading(null);
  };

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-brand-text text-center mb-3">Fiyatlandırma</h2>
        <p className="font-body text-brand-muted text-center mb-12">Avukat masrafından tasarruf edin, profesyonel sözleşmelerle güvende olun.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            { id: 'starter', name: 'Başlangıç', price: '₺199', period: 'tek seferlik', features: ['5 sözleşme hakkı', '4 şablon türü', 'AI hukuki düzenleme', 'PDF indirme', 'Logo ekleme'], popular: false },
            { id: 'pro', name: 'Profesyonel', price: '₺49', period: '/ ay', features: ['Sınırsız sözleşme', '4 şablon türü', 'AI hukuki düzenleme', 'PDF indirme', 'Logo ekleme', 'Öncelikli destek', 'Sözleşme arşivi'], popular: true },
          ].map(plan => (
            <div key={plan.id} className={`bg-brand-card rounded-xl p-8 relative ${plan.popular ? 'border-2 border-brand-accent' : 'border border-brand-border'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-accent to-brand-accent-dark text-brand-bg text-xs font-bold px-4 py-1 rounded-full font-body">En Popüler</div>}
              <h3 className="font-display text-2xl font-bold text-brand-text mb-1">{plan.name}</h3>
              <div className="mb-6"><span className="font-display text-4xl font-extrabold text-brand-accent">{plan.price}</span><span className="font-body text-sm text-brand-muted ml-1">{plan.period}</span></div>
              <div className="flex flex-col gap-2.5 mb-7">
                {plan.features.map((f, i) => <div key={i} className="flex items-center gap-2"><span className="text-green-400 text-sm">✓</span><span className="font-body text-sm text-brand-muted">{f}</span></div>)}
              </div>
              <button onClick={() => selectPlan(plan.id)} disabled={loading === plan.id} className={`w-full py-3 rounded-lg font-body font-bold text-sm transition-all ${plan.popular ? 'bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg' : 'border-2 border-brand-accent text-brand-accent hover:bg-brand-elevated'} disabled:opacity-50`}>
                {loading === plan.id ? 'Ödeme sayfasına yönlendiriliyor...' : user?.plan === plan.id ? '✓ Aktif Plan' : plan.popular ? 'Hemen Başla' : 'Satın Al'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
function Dashboard({ user, setPage, onViewContract }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getContracts()
      .then(data => setContracts(data.contracts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-text mb-1">Hoş geldiniz, {user?.name}</h2>
            <p className="font-body text-sm text-brand-muted">
              Plan: <span className="text-brand-accent font-semibold">{user?.plan === 'pro' ? 'Profesyonel' : user?.plan === 'starter' ? 'Başlangıç' : 'Plan Yok'}</span>
              {user?.plan === 'starter' && ` • ${user?.contracts_left} sözleşme kaldı`}
            </p>
          </div>
          <button onClick={() => setPage('templates')} className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm">+ Yeni Sözleşme</button>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin mx-auto" /></div>
        ) : contracts.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-display text-xl font-bold text-brand-text mb-2">Henüz sözleşmeniz yok</h3>
            <p className="font-body text-sm text-brand-muted mb-6">İlk sözleşmenizi oluşturarak başlayın.</p>
            <button onClick={() => setPage('templates')} className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm">Şablon Seç →</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map(c => (
              <div key={c.id} onClick={() => onViewContract(c.id)}
                className="bg-brand-card border border-brand-border rounded-xl p-5 flex justify-between items-center hover:border-brand-accent/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{c.template_icon || '📄'}</div>
                  <div>
                    <h4 className="font-display text-base font-bold text-brand-text group-hover:text-brand-accent transition-colors">{c.title}</h4>
                    <p className="font-body text-xs text-brand-muted">{new Date(c.created_at).toLocaleDateString('tr-TR')} • {c.template_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs px-2.5 py-1 rounded bg-green-400/10 text-green-400 font-semibold capitalize">{c.status}</span>
                  <span className="font-body text-xs text-brand-dim group-hover:text-brand-accent transition-colors">Görüntüle →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Contract Detail (load from DB by ID) ─────────────────────
function ContractDetail({ contractId, setPage, onBackToDashboard }) {
  const [contract, setContract] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeVersion, setActiveVersion] = useState(null);

  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    api.getContract(contractId)
      .then(data => {
        setContract(data.contract);
        setVersions(data.versions || []);
        setActiveVersion(null); // show latest (contract.generated_text)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [contractId]);

  const displayText = activeVersion
    ? activeVersion.generated_text
    : contract?.generated_text;

  const displayNotes = activeVersion
    ? (activeVersion.ai_notes || [])
    : (contract?.ai_notes || []);

  const templateTitle = contract?.template_title || 'Sözleşme';

  const handlePdf = async () => {
    if (!displayText) return;
    setPdfLoading(true);
    try {
      const blob = await api.generatePdf({
        contract_id: contract.id,
        contract_text: displayText,
        ai_notes: displayNotes,
        logo_base64: logoUrl || null,
        template_title: templateTitle,
      });
      api.downloadBlob(blob, `sozhane-${contract.id.slice(0, 8)}-${Date.now()}.pdf`);
    } catch {
      // Fallback: browser print
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>${templateTitle}</title><style>body{font-family:sans-serif;padding:48px;font-size:13px;line-height:1.7;color:#1a1a1a;}pre{white-space:pre-wrap;font-family:inherit;}</style></head><body><pre>${displayText}</pre><hr><p style="font-size:11px;color:#888;">⚖️ Bu belge Sözhane platformu aracılığıyla oluşturulmuştur. Avukatlık hizmeti niteliği taşımaz.</p><script>window.print();</script></body></html>`);
      win.document.close();
    }
    setPdfLoading(false);
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-10 h-10 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-body text-brand-muted">Sözleşme yükleniyor...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="py-20 px-6">
        <div className="max-w-xl mx-auto bg-brand-card border border-red-500/30 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="font-display text-xl font-bold text-brand-text mb-2">Sözleşme Bulunamadı</h3>
          <p className="font-body text-sm text-brand-muted mb-6">{error || 'Bu sözleşmeye erişilemiyor.'}</p>
          <button onClick={onBackToDashboard} className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm">← Sözleşmelerime Dön</button>
        </div>
      </div>
    );
  }

  const formData = contract.form_data || {};

  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard}
              className="bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-brand-muted text-sm font-body hover:text-brand-text transition-colors">
              ← Sözleşmelerim
            </button>
            <div>
              <h2 className="font-display text-xl font-bold text-brand-text">{contract.title}</h2>
              <p className="font-body text-xs text-brand-muted mt-0.5">
                {contract.template_title} • {new Date(contract.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                {contract.status && <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-green-400/10 text-green-400 font-semibold capitalize">{contract.status}</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePdf} disabled={pdfLoading}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity">
              {pdfLoading ? '⏳ Oluşturuluyor...' : '📄 PDF İndir'}
            </button>
          </div>
        </div>

        {/* Version selector (if multiple versions exist) */}
        {versions.length > 1 && (
          <div className="mb-5 flex items-center gap-2 flex-wrap">
            <span className="font-body text-xs text-brand-dim">Versiyon:</span>
            <button
              onClick={() => setActiveVersion(null)}
              className={`px-3 py-1 rounded-md text-xs font-body font-medium transition-colors ${
                !activeVersion ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/40' : 'bg-brand-elevated text-brand-muted border border-brand-border hover:text-brand-text'
              }`}>
              Güncel
            </button>
            {versions.map((v, i) => (
              <button key={v.id}
                onClick={() => setActiveVersion(v)}
                className={`px-3 py-1 rounded-md text-xs font-body font-medium transition-colors ${
                  activeVersion?.id === v.id ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/40' : 'bg-brand-elevated text-brand-muted border border-brand-border hover:text-brand-text'
                }`}>
                v{v.version_number}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
          {/* Document */}
          <div className="bg-[#FEFDFB] border border-[#E8E4DD] rounded-xl p-9">
            {/* Logo upload */}
            <div className="mb-5">
              {logoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="Logo" className="max-h-12" />
                  <button onClick={() => setLogoUrl('')} className="text-xs text-gray-400 hover:text-gray-600 font-body">Kaldır</button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer text-gray-500 text-sm font-body hover:border-gray-400 transition-colors">
                  🏢 Logo Ekle (PDF'e yansır)
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onload = ev => setLogoUrl(ev.target.result); r.readAsDataURL(file); }
                  }} />
                </label>
              )}
            </div>

            <pre className="font-body text-[13px] leading-[1.8] text-[#2A2A2A] whitespace-pre-wrap break-words">{displayText}</pre>

            <div className="mt-8 pt-4 border-t border-[#E8E4DD] text-[11px] text-gray-400 leading-relaxed font-body">
              ⚖️ <strong>Yasal Uyarı:</strong> Bu belge Sözhane platformu aracılığıyla oluşturulmuş olup, avukatlık hizmeti niteliği taşımamaktadır.
              Sözleşmenin hukuki sorumluluğu tamamen kullanıcıya aittir.
            </div>
          </div>

          {/* Sidebar */}
          <div className="sticky top-20 flex flex-col gap-3">
            {/* AI Notes */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold text-brand-text mb-4 flex items-center gap-2">🤖 AI Hukuki Dipnotlar</h3>
              {displayNotes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {displayNotes.map((n, i) => (
                    <div key={i} className="bg-brand-accent/10 border-l-[3px] border-brand-accent rounded-r-lg p-3">
                      <p className="font-body text-xs font-semibold text-brand-accent mb-1">{n.title}</p>
                      <p className="font-body text-xs text-brand-muted leading-relaxed">{n.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-brand-dim">AI dipnotu bulunmuyor.</p>
              )}
            </div>

            {/* Contract metadata */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-4">
              <h4 className="font-body text-xs font-semibold text-brand-muted mb-3">Sözleşme Bilgileri</h4>
              <div className="flex flex-col gap-2 text-xs font-body">
                <div className="flex justify-between"><span className="text-brand-dim">ID</span><span className="text-brand-muted font-mono">{contract.id.slice(0, 8)}...</span></div>
                <div className="flex justify-between"><span className="text-brand-dim">Oluşturma</span><span className="text-brand-muted">{new Date(contract.created_at).toLocaleString('tr-TR')}</span></div>
                {contract.updated_at !== contract.created_at && (
                  <div className="flex justify-between"><span className="text-brand-dim">Son Güncelleme</span><span className="text-brand-muted">{new Date(contract.updated_at).toLocaleString('tr-TR')}</span></div>
                )}
                <div className="flex justify-between"><span className="text-brand-dim">Versiyonlar</span><span className="text-brand-muted">{versions.length || 1}</span></div>
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-4">
              <p className="font-body text-xs text-brand-dim leading-relaxed">
                💡 PDF'i istediğiniz zaman tekrar indirebilirsiniz. Sözleşme metniniz güvenle saklanmaktadır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Template Selection ───────────────────────────────────────
function TemplateSelect({ templates, setPage, setSelectedTemplate }) {
  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-brand-text text-center mb-2">Şablon Seçin</h2>
        <p className="font-body text-brand-muted text-center mb-10">İhtiyacınıza uygun sözleşme türünü seçin</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map(t => (
            <div key={t.id} onClick={() => { setSelectedTemplate(t); setPage('form'); }}
              className="bg-brand-card border border-brand-border rounded-xl p-7 cursor-pointer hover:border-brand-accent hover:-translate-y-0.5 transition-all relative">
              {t.is_popular && <div className="absolute top-3 right-3 bg-brand-accent/15 text-brand-accent text-xs font-semibold px-2.5 py-0.5 rounded font-body">Popüler</div>}
              <div className="text-4xl mb-3">{t.icon}</div>
              <h3 className="font-display text-xl font-bold text-brand-text mb-1.5">{t.title}</h3>
              <p className="font-body text-sm text-brand-muted leading-relaxed mb-3">{t.description}</p>
              <span className="font-body text-xs text-brand-dim">{t.fields_schema.length} alan • {new Set(t.fields_schema.map(f => f.section)).size} bölüm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dynamic Form Engine ──────────────────────────────────────
function FormEngine({ template, setPage, onGenerate }) {
  const fields = template.fields_schema;
  const sections = {};
  fields.forEach(f => { if (!sections[f.section]) sections[f.section] = []; sections[f.section].push(f); });
  const sectionNames = Object.keys(sections);

  const [formData, setFormData] = useState(() => {
    const init = {};
    fields.forEach(f => { init[f.id] = f.defaultValue !== undefined ? String(f.defaultValue) : ''; });
    return init;
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);

  const validate = () => {
    const errs = {};
    fields.forEach(f => { if (f.required && !formData[f.id]?.trim()) errs[f.id] = 'Zorunlu'; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step < sectionNames.length - 1) {
      setStep(s => s + 1);
    } else if (validate()) {
      onGenerate(formData);
    }
  };

  const currFields = sections[sectionNames[step]] || [];
  const inputCls = 'w-full bg-brand-input border border-brand-border rounded-lg px-4 py-3 text-brand-text font-body text-sm outline-none focus:border-brand-accent transition-colors';

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setPage('templates')} className="bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-brand-muted text-sm font-body hover:text-brand-text transition-colors">← Geri</button>
          <h2 className="font-display text-xl font-bold text-brand-text">{template.icon} {template.title}</h2>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {sectionNames.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-1 w-full rounded-full transition-colors ${i <= step ? 'bg-brand-accent' : 'bg-brand-elevated'}`} />
              <span className={`font-body text-[10px] cursor-pointer transition-colors ${i === step ? 'text-brand-accent font-semibold' : 'text-brand-dim'}`} onClick={() => setStep(i)}>{s}</span>
            </div>
          ))}
        </div>

        {/* Fields */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-8">
          <h3 className="font-display text-lg font-bold text-brand-text mb-6">{sectionNames[step]}</h3>
          <div className="flex flex-col gap-5">
            {currFields.map(field => (
              <div key={field.id}>
                <label className="block text-xs text-brand-muted mb-1.5 font-body font-medium">
                  {field.label} {field.required && <span className="text-brand-accent">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea value={formData[field.id]} onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                    placeholder={field.placeholder || ''} rows={3} className={`${inputCls} resize-y min-h-[80px]`} />
                ) : field.type === 'select' ? (
                  <select value={formData[field.id]} onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                    <option value="">Seçiniz...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={formData[field.id]} onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                    placeholder={field.placeholder || ''} className={inputCls} />
                )}
                {errors[field.id] && <span className="text-xs text-red-400 mt-1 block font-body">{errors[field.id]}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-5 py-2.5 rounded-lg border border-brand-accent text-brand-accent font-body font-semibold text-sm disabled:opacity-30 transition-opacity">← Önceki</button>
          <button onClick={handleNext}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm hover:opacity-90 transition-opacity">
            {step === sectionNames.length - 1 ? '🤖 AI ile Oluştur →' : 'Sonraki →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contract Preview ─────────────────────────────────────────
function Preview({ contract, template, setPage, user, onSaveAndView }) {
  const [logoUrl, setLogoUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await api.generatePdf({
        contract_text: contract.generated_text,
        ai_notes: contract.ai_notes,
        logo_base64: logoUrl || null,
        template_title: template.title,
      });
      api.downloadBlob(blob, `sozhane-${template.id}-${Date.now()}.pdf`);
    } catch (err) {
      // Fallback: browser print
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>${template.title}</title><style>body{font-family:sans-serif;padding:48px;font-size:13px;line-height:1.7;}pre{white-space:pre-wrap;}</style></head><body><pre>${contract.generated_text}</pre><script>window.print();</script></body></html>`);
      win.document.close();
    }
    setPdfLoading(false);
  };

  const handleSave = () => {
    // Contract is already saved to DB via createContract in handleGenerate.
    // Navigate to the persisted detail view using the contract's DB id.
    if (contract?.id) {
      onSaveAndView(contract.id);
    } else {
      // Fallback: if for some reason there's no id (AI-only fallback path), go to dashboard
      setPage('dashboard');
    }
  };

  const notes = contract.ai_notes || [];

  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage('form')} className="bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 text-brand-muted text-sm font-body">← Formu Düzenle</button>
            <h2 className="font-display text-xl font-bold text-brand-text">Sözleşme Önizleme</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2.5 rounded-lg border border-brand-accent text-brand-accent font-body font-semibold text-sm hover:bg-brand-elevated transition-colors">💾 Kaydet & Görüntüle</button>
            <button onClick={handlePdf} disabled={pdfLoading} className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark text-brand-bg font-body font-bold text-sm disabled:opacity-50">
              {pdfLoading ? 'Oluşturuluyor...' : '📄 PDF İndir'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
          {/* Document */}
          <div className="bg-[#FEFDFB] border border-[#E8E4DD] rounded-xl p-9">
            <div className="mb-5">
              {logoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="Logo" className="max-h-12" />
                  <button onClick={() => setLogoUrl('')} className="text-xs text-gray-400 hover:text-gray-600">Kaldır</button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer text-gray-500 text-sm font-body hover:border-gray-400 transition-colors">
                  🏢 Logo Ekle
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onload = ev => setLogoUrl(ev.target.result); r.readAsDataURL(file); }
                  }} />
                </label>
              )}
            </div>
            <pre className="font-body text-[13px] leading-[1.8] text-[#2A2A2A] whitespace-pre-wrap break-words">{contract.generated_text}</pre>
            <div className="mt-8 pt-4 border-t border-[#E8E4DD] text-[11px] text-gray-400 leading-relaxed font-body">
              ⚖️ <strong>Yasal Uyarı:</strong> Bu belge Sözhane platformu aracılığıyla oluşturulmuş olup, avukatlık hizmeti niteliği taşımamaktadır.
              Sözleşmenin hukuki sorumluluğu tamamen kullanıcıya aittir.
            </div>
          </div>

          {/* AI Notes Sidebar */}
          <div className="sticky top-20">
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold text-brand-text mb-4 flex items-center gap-2">🤖 AI Hukuki Dipnotlar</h3>
              {notes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {notes.map((n, i) => (
                    <div key={i} className="bg-brand-accent/10 border-l-[3px] border-brand-accent rounded-r-lg p-3">
                      <p className="font-body text-xs font-semibold text-brand-accent mb-1">{n.title}</p>
                      <p className="font-body text-xs text-brand-muted leading-relaxed">{n.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-brand-dim">Dipnot bulunmuyor.</p>
              )}
            </div>
            <div className="bg-brand-card border border-brand-border rounded-xl p-4 mt-3">
              <p className="font-body text-xs text-brand-dim leading-relaxed">
                💡 AI tarafından düzenlenen maddeler, 6098 sayılı TBK ve ilgili mevzuata uygun hale getirilmiştir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════
// ── URL Hash Router ──────────────────────────────────────────
function useHashRouter() {
  const [route, setRoute] = useState({ page: 'landing', segments: [], params: {}, contractId: null, templateId: null });

  useEffect(() => {
    // Set initial route from hash (client-side only)
    setRoute(parseHash(window.location.hash));
    const handleHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = useCallback((page, params = {}) => {
    let hash = `#/${page}`;
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) searchParams.set(k, v); });
    const qs = searchParams.toString();
    if (qs) hash += `?${qs}`;
    window.location.hash = hash;
  }, []);

  return { route, navigate };
}

function parseHash(hash) {
  const clean = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = clean.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(queryPart || ''));

  // Route mapping
  const page = segments[0] || 'landing';

  return {
    page,
    segments,
    params,
    // Specific extractors
    contractId: page === 'contracts' ? segments[1] : null,
    templateId: params.template || null,
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════
export default function SozhaneApp() {
  const auth = useAuth();
  const { templates } = useTemplates();
  const { route, navigate } = useHashRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentContract, setCurrentContract] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  // Convenience: setPage that maps to hash navigation
  const setPage = useCallback((page) => navigate(page), [navigate]);

  // Navigate to contract detail
  const navigateToContract = useCallback((contractId) => {
    navigate('contracts', {}); // clear params
    window.location.hash = `#/contracts/${contractId}`;
  }, [navigate]);

  const navigateToDashboard = useCallback(() => {
    navigate('dashboard');
  }, [navigate]);

  // Handle Stripe payment return (success/cancel in URL params)
  useEffect(() => {
    if (route.params.payment === 'success') {
      setToast({ type: 'success', message: `${route.params.plan === 'pro' ? 'Profesyonel' : 'Başlangıç'} plan başarıyla aktifleştirildi!` });
      auth.refreshUser();
      // Clean URL
      setTimeout(() => navigate('dashboard'), 100);
    } else if (route.params.payment === 'cancelled') {
      setToast({ type: 'warning', message: 'Ödeme iptal edildi.' });
      setTimeout(() => navigate('pricing'), 100);
    }
  }, [route.params.payment]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleGenerate = async (formData) => {
    if (!auth.user?.plan) { navigate('pricing'); return; }

    navigate('preview');
    setGenerating(true);

    try {
      const result = await api.createContract({
        template_id: selectedTemplate.id,
        form_data: formData,
      });

      setCurrentContract(result.contract);
      await auth.refreshUser();
    } catch (err) {
      try {
        const aiResult = await api.generateAI({
          template_id: selectedTemplate.id,
          form_data: formData,
        });
        setCurrentContract({
          generated_text: aiResult.contract,
          ai_notes: aiResult.notes,
        });
      } catch (err2) {
        setToast({ type: 'error', message: err2.message || err.message });
        navigate('form');
      }
    }

    setGenerating(false);
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  // Route-based page resolution
  const page = route.page;

  const renderPage = () => {
    switch (page) {
      case 'landing': return <Landing setPage={setPage} />;
      case 'login': return <AuthForm mode="login" setPage={setPage} authActions={auth} />;
      case 'register': return <AuthForm mode="register" setPage={setPage} authActions={auth} />;
      case 'pricing': return <Pricing setPage={setPage} user={auth.user} refreshUser={auth.refreshUser} setToast={setToast} />;
      case 'dashboard': return <Dashboard user={auth.user} setPage={setPage} onViewContract={navigateToContract} />;
      case 'templates': return <TemplateSelect templates={templates} setPage={setPage} setSelectedTemplate={setSelectedTemplate} />;
      case 'form':
        return selectedTemplate ? <FormEngine template={selectedTemplate} setPage={setPage} onGenerate={handleGenerate} /> : (navigate('templates'), null);
      case 'preview':
        if (generating) {
          return (
            <div className="py-32 text-center">
              <div className="w-12 h-12 border-3 border-brand-border border-t-brand-accent rounded-full animate-spin mx-auto mb-6" />
              <p className="font-body text-brand-muted text-lg">🤖 AI sözleşmenizi düzenliyor...</p>
              <p className="font-body text-brand-dim text-sm mt-2">Türk hukukuna uygunluk kontrolü yapılıyor</p>
            </div>
          );
        }
        return currentContract && selectedTemplate
          ? <Preview contract={currentContract} template={selectedTemplate} setPage={setPage} user={auth.user} onSaveAndView={navigateToContract} />
          : (navigate('templates'), null);
      case 'contracts':
        // /contracts/:id → detail view
        if (route.contractId) {
          return <ContractDetail contractId={route.contractId} setPage={setPage} onBackToDashboard={navigateToDashboard} />;
        }
        // /contracts → redirect to dashboard
        return <Dashboard user={auth.user} setPage={setPage} onViewContract={navigateToContract} />;
      default: return <Landing setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <Navbar page={page} setPage={setPage} user={auth.user} onLogout={async () => { await auth.logout(); navigate('landing'); }} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`rounded-lg px-5 py-3 shadow-lg border font-body text-sm flex items-center gap-3 max-w-sm ${
            toast.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' :
            toast.type === 'error'   ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                                       'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
          }`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : '⚠'}</span>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
          </div>
        </div>
      )}

      {renderPage()}
      <footer className="border-t border-brand-border py-6 text-center mt-10">
        <p className="font-body text-xs text-brand-dim">© 2026 Sözhane — Türkçe Hukuki Sözleşme Otomasyonu</p>
        <p className="font-body text-[10px] text-brand-dim mt-1">⚖️ Avukatlık hizmeti sunulmamaktadır. Hukuki sorumluluk kullanıcıya aittir.</p>
      </footer>
    </div>
  );
}
