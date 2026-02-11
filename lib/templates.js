// ═══════════════════════════════════════════════════════════════
// lib/templates.js — Contract Template Definitions
// ═══════════════════════════════════════════════════════════════

const TEMPLATES = [
  // ── 1. NDA (Gizlilik Sözleşmesi) ────────────────────────
  {
    id: 'nda',
    title: 'Gizlilik Sözleşmesi (NDA)',
    icon: '🔒',
    description: 'Ticari sırlarınızı ve gizli bilgilerinizi koruma altına alın.',
    category: 'Koruma',
    is_popular: 1,
    sort_order: 1,
    fields_schema: [
      { id: 'discloser_name', label: 'Bilgiyi Açıklayan Taraf (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'discloser_address', label: 'Açıklayan Taraf Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'discloser_tax', label: 'Vergi No / TC Kimlik No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'receiver_name', label: 'Bilgiyi Alan Taraf (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'receiver_address', label: 'Alan Taraf Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'receiver_tax', label: 'Vergi No / TC Kimlik No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'confidential_info', label: 'Gizli Bilginin Kapsamı', type: 'textarea', required: true, section: 'Kapsam', placeholder: 'Örn: Müşteri listeleri, fiyatlandırma stratejileri, teknik dökümanlar...' },
      { id: 'purpose', label: 'Bilgi Paylaşım Amacı', type: 'text', required: true, section: 'Kapsam', placeholder: 'Örn: Ortak proje geliştirme, iş birliği değerlendirmesi...' },
      { id: 'duration_months', label: 'Gizlilik Süresi (Ay)', type: 'number', required: true, section: 'Süre', defaultValue: 24 },
      { id: 'penalty_amount', label: 'Cezai Şart Tutarı (₺)', type: 'number', required: false, section: 'Yaptırımlar', placeholder: 'Opsiyonel' },
      { id: 'jurisdiction', label: 'Yetkili Mahkeme', type: 'select', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'], required: true, section: 'Hukuki' },
      { id: 'special_clauses', label: 'Özel Maddeler', type: 'textarea', required: false, section: 'Ek Maddeler', placeholder: 'Eklemek istediğiniz özel hükümler...' },
    ],
    base_text: `GİZLİLİK SÖZLEŞMESİ

1. TARAFLAR

İşbu Gizlilik Sözleşmesi ("Sözleşme"), bir tarafta {{discloser_name}} ("Açıklayan Taraf") ile diğer tarafta {{receiver_name}} ("Alan Taraf") arasında aşağıda belirtilen şartlar dahilinde akdedilmiştir.

Açıklayan Taraf:
Ad/Ünvan: {{discloser_name}}
Adres: {{discloser_address}}
Vergi/TC No: {{discloser_tax}}

Alan Taraf:
Ad/Ünvan: {{receiver_name}}
Adres: {{receiver_address}}
Vergi/TC No: {{receiver_tax}}

2. TANIMLAR

"Gizli Bilgi" terimi, Açıklayan Taraf tarafından Alan Taraf'a yazılı, sözlü veya elektronik ortamda açıklanan, ticari, mali, teknik veya başka nitelikteki her türlü bilgiyi ifade eder. Bu kapsamda özellikle şu bilgiler yer almaktadır:

{{confidential_info}}

3. AMAÇ

İşbu Sözleşme kapsamında gizli bilgilerin paylaşılma amacı: {{purpose}}

4. GİZLİLİK YÜKÜMLÜLÜKLERİ

4.1. Alan Taraf, Gizli Bilgileri yalnızca Sözleşme'de belirtilen amaç doğrultusunda kullanacaktır.
4.2. Alan Taraf, Gizli Bilgileri üçüncü kişilerle paylaşmayacak, çoğaltmayacak ve amacı dışında kullanmayacaktır.
4.3. Alan Taraf, Gizli Bilgilerin korunması için makul özeni gösterecek ve kendi gizli bilgilerine uyguladığı koruma tedbirlerinden daha azını uygulamayacaktır.
4.4. Alan Taraf, Gizli Bilgilere erişimi yalnızca bilmesi gereken çalışanları ile sınırlı tutacaktır.

5. İSTİSNALAR

Aşağıdaki bilgiler gizlilik yükümlülüğü kapsamı dışındadır:
a) Açıklanma tarihinde kamuya açık olan veya sonradan Alan Taraf'ın kusuru olmaksızın kamuya açık hale gelen bilgiler
b) Alan Taraf'ın bağımsız olarak geliştirdiği bilgiler
c) Üçüncü bir taraftan gizlilik yükümlülüğü olmaksızın meşru yollarla elde edilen bilgiler
d) Yasal zorunluluk veya mahkeme/idari makam kararı nedeniyle açıklanması gereken bilgiler (bu durumda Açıklayan Taraf derhal bilgilendirilecektir)

6. SÜRE

İşbu Sözleşme imza tarihinden itibaren {{duration_months}} ({{duration_months_text}}) ay süreyle geçerlidir. Gizlilik yükümlülükleri, Sözleşme'nin herhangi bir nedenle sona ermesinden sonra da {{duration_months}} ay boyunca devam eder.

7. CEZAİ ŞART

{{penalty_clause}}

8. İADE YÜKÜMLÜLÜĞÜ

Sözleşme'nin sona ermesi veya Açıklayan Taraf'ın talebi üzerine, Alan Taraf elindeki tüm Gizli Bilgileri ve bunların kopyalarını 10 (on) iş günü içinde iade edecek veya imha edecek ve buna ilişkin yazılı beyan verecektir.

9. UYUŞMAZLIKLARIN ÇÖZÜMÜ

İşbu Sözleşme'den doğabilecek uyuşmazlıklarda {{jurisdiction}} Mahkemeleri ve İcra Daireleri yetkilidir.

10. GENEL HÜKÜMLER

10.1. İşbu Sözleşme, tarafların karşılıklı yazılı mutabakatı ile değiştirilebilir.
10.2. Sözleşme'nin herhangi bir hükmünün geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez (bölünebilirlik).
10.3. İşbu Sözleşme, 6098 sayılı Türk Borçlar Kanunu hükümlerine tabidir.
10.4. Taraflar arasındaki bildirimler yazılı olarak ve yukarıda belirtilen adreslere yapılacaktır.

{{special_clauses_section}}

İşbu Sözleşme, 2 (iki) nüsha olarak düzenlenmiş ve taraflarca okunarak imza altına alınmıştır.


Açıklayan Taraf                          Alan Taraf
{{discloser_name}}                       {{receiver_name}}

İmza: _______________                    İmza: _______________
Tarih: ___/___/______                    Tarih: ___/___/______`,
  },

  // ── 2. Hizmet Sözleşmesi ────────────────────────────────
  {
    id: 'service',
    title: 'Hizmet Sözleşmesi',
    icon: '📋',
    description: 'Hizmet alım-satımı için kapsamlı sözleşme.',
    category: 'Ticari',
    is_popular: 1,
    sort_order: 2,
    fields_schema: [
      { id: 'provider_name', label: 'Hizmet Veren (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'provider_address', label: 'Hizmet Veren Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'provider_tax', label: 'Vergi No / TC Kimlik No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'client_name', label: 'Hizmet Alan (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'client_address', label: 'Hizmet Alan Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'client_tax', label: 'Vergi No / TC Kimlik No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'service_description', label: 'Hizmetin Tanımı ve Kapsamı', type: 'textarea', required: true, section: 'Hizmet Detayları', placeholder: 'Verilecek hizmetin detaylı açıklaması...' },
      { id: 'deliverables', label: 'Teslim Edilecekler', type: 'textarea', required: true, section: 'Hizmet Detayları', placeholder: 'Somut çıktılar, raporlar, ürünler...' },
      { id: 'start_date', label: 'Başlangıç Tarihi', type: 'date', required: true, section: 'Süre ve Ödeme' },
      { id: 'end_date', label: 'Bitiş Tarihi', type: 'date', required: true, section: 'Süre ve Ödeme' },
      { id: 'total_fee', label: 'Toplam Hizmet Bedeli (₺)', type: 'number', required: true, section: 'Süre ve Ödeme' },
      { id: 'payment_terms', label: 'Ödeme Koşulları', type: 'select', options: ['Peşin', '50% Peşin - 50% Teslimde', 'Aylık Eşit Taksit', 'Teslimde Tek Seferde', 'Özel'], required: true, section: 'Süre ve Ödeme' },
      { id: 'revision_count', label: 'Ücretsiz Revizyon Hakkı', type: 'number', required: false, section: 'Hizmet Detayları', defaultValue: 2 },
      { id: 'cancellation_notice', label: 'Fesih İhbar Süresi (Gün)', type: 'number', required: true, section: 'Fesih', defaultValue: 15 },
      { id: 'jurisdiction', label: 'Yetkili Mahkeme', type: 'select', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'], required: true, section: 'Hukuki' },
      { id: 'special_clauses', label: 'Özel Maddeler', type: 'textarea', required: false, section: 'Ek Maddeler' },
    ],
    base_text: `HİZMET SÖZLEŞMESİ

1. TARAFLAR

İşbu Hizmet Sözleşmesi ("Sözleşme"), aşağıda bilgileri yer alan taraflar arasında karşılıklı mutabakat ile akdedilmiştir.

Hizmet Veren ("Yüklenici"):
Ad/Ünvan: {{provider_name}}
Adres: {{provider_address}}
Vergi/TC No: {{provider_tax}}

Hizmet Alan ("İşveren"):
Ad/Ünvan: {{client_name}}
Adres: {{client_address}}
Vergi/TC No: {{client_tax}}

2. SÖZLEŞMENİN KONUSU

Yüklenici, işbu Sözleşme'de belirtilen koşullar dahilinde aşağıdaki hizmeti İşveren'e sunacaktır:

{{service_description}}

3. TESLİM EDİLECEKLER

Hizmet kapsamında aşağıdaki çıktılar teslim edilecektir:
{{deliverables}}

4. SÜRE

4.1. Sözleşme {{start_date}} tarihinde başlar ve {{end_date}} tarihinde sona erer.
4.2. Tarafların yazılı mutabakatı ile süre uzatılabilir.
4.3. Mücbir sebep halleri süreyi otomatik olarak uzatır.

5. HİZMET BEDELİ VE ÖDEME

5.1. Toplam hizmet bedeli {{total_fee}} TL'dir (KDV hariç).
5.2. Ödeme koşulları: {{payment_terms}}
5.3. Fatura, ilgili ödeme döneminde düzenlenir ve fatura tarihinden itibaren 7 (yedi) iş günü içinde ödeme yapılır.
5.4. Geç ödemelere 6183 sayılı Kanun'un 51. maddesi uyarınca gecikme zammı oranında faiz uygulanır.
5.5. KDV, yasal oran üzerinden ayrıca hesaplanarak faturaya yansıtılır.

6. REVİZYON VE DEĞİŞİKLİKLER

6.1. İşveren, teslim edilen çalışmalar için {{revision_count}} adet ücretsiz revizyon hakkına sahiptir.
6.2. Revizyon talepleri teslimden itibaren 5 (beş) iş günü içinde yazılı olarak bildirilir.
6.3. Kapsam dışı değişiklikler veya ek revizyonlar, tarafların mutabakatı ile ayrıca ücretlendirilir.

7. TARAFLARIN YÜKÜMLÜLÜKLERİ

7.1. Yüklenici:
   a) Hizmeti profesyonel standartlarda, özenle ve zamanında sunmakla,
   b) İşveren'in ticari bilgilerini gizli tutmakla,
   c) İlgili mevzuata uygun hareket etmekle yükümlüdür.

7.2. İşveren:
   a) Gerekli bilgi, belge ve materyalleri zamanında sağlamakla,
   b) Hizmet bedelini zamanında ödemekle,
   c) Proje kapsamıyla ilgili kararları makul sürede vermekle yükümlüdür.

8. FİKRİ MÜLKİYET

8.1. Hizmet kapsamında üretilen tüm özgün eserler, hizmet bedelinin tamamının ödenmesi ile birlikte 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında İşveren'e devredilir.
8.2. Yüklenici, eserleri referans/portföy amaçlı kullanım hakkını saklı tutar (aksi yazılı olarak kararlaştırılmadıkça).
8.3. Üçüncü kişilerin fikri mülkiyet haklarını ihlal eden eserlerden Yüklenici sorumludur.

9. GİZLİLİK

9.1. Taraflar, Sözleşme kapsamında edindikleri tüm ticari, teknik ve mali bilgileri gizli tutacaktır.
9.2. Gizlilik yükümlülüğü, Sözleşme'nin sona ermesinden sonra 2 (iki) yıl daha devam eder.

10. FESİH

10.1. Taraflardan her biri, {{cancellation_notice}} gün önceden yazılı bildirimde bulunarak Sözleşme'yi feshedebilir.
10.2. Fesih halinde, fesih tarihine kadar tamamlanmış işlerin bedeli tam olarak ödenir.
10.3. Haklı fesih halleri: Taraflardan birinin Sözleşme yükümlülüklerini yazılı uyarıya rağmen 15 gün içinde yerine getirmemesi halinde, diğer taraf Sözleşme'yi derhal feshedebilir.

11. MÜCBİR SEBEPLER

Tarafların kontrolü dışındaki olağanüstü durumlar (doğal afet, savaş, salgın hastalık, yasal düzenleme değişiklikleri vb.) mücbir sebep sayılır. Bu süre zarfında yükümlülükler askıya alınır. Mücbir sebep 30 (otuz) günü aşarsa, taraflar Sözleşme'yi tazminatsız feshedebilir.

12. UYUŞMAZLIKLARIN ÇÖZÜMÜ

12.1. Taraflar, uyuşmazlıkları öncelikle müzakere yoluyla çözmeye çalışacaktır.
12.2. Müzakere ile çözülemeyen uyuşmazlıklarda {{jurisdiction}} Mahkemeleri ve İcra Daireleri yetkilidir.

13. GENEL HÜKÜMLER

13.1. İşbu Sözleşme, 6098 sayılı Türk Borçlar Kanunu hükümlerine tabidir.
13.2. Sözleşme'de yapılacak değişiklikler yazılı olarak ve tarafların karşılıklı imzası ile geçerlidir.
13.3. Sözleşme'nin herhangi bir hükmünün geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez.

{{special_clauses_section}}

İşbu Sözleşme, 2 (iki) nüsha olarak düzenlenmiş ve taraflarca okunarak imza altına alınmıştır.


Hizmet Veren                              Hizmet Alan
{{provider_name}}                         {{client_name}}

İmza: _______________                     İmza: _______________
Tarih: ___/___/______                     Tarih: ___/___/______`,
  },

  // ── 3. Freelance Sözleşme ───────────────────────────────
  {
    id: 'freelance',
    title: 'Freelance Sözleşme',
    icon: '💼',
    description: 'Bağımsız çalışanlar için iş yapma sözleşmesi.',
    category: 'Freelance',
    is_popular: 1,
    sort_order: 3,
    fields_schema: [
      { id: 'freelancer_name', label: 'Freelancer (Ad Soyad)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'freelancer_address', label: 'Freelancer Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'freelancer_tax', label: 'TC Kimlik No / Vergi No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'freelancer_iban', label: 'IBAN', type: 'text', required: true, section: 'Taraflar' },
      { id: 'client_name', label: 'İşveren / Müşteri (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'client_address', label: 'İşveren Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'client_tax', label: 'Vergi No / TC Kimlik No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'project_name', label: 'Proje Adı', type: 'text', required: true, section: 'Proje Detayları' },
      { id: 'project_scope', label: 'Proje Kapsamı ve Yapılacak İşler', type: 'textarea', required: true, section: 'Proje Detayları' },
      { id: 'milestones', label: 'Kilometre Taşları / Teslimatlar', type: 'textarea', required: true, section: 'Proje Detayları', placeholder: '1. Tasarım teslimi - 15 gün\\n2. Geliştirme - 30 gün\\n3. Test ve teslim - 7 gün' },
      { id: 'project_fee', label: 'Proje Bedeli (₺)', type: 'number', required: true, section: 'Ödeme' },
      { id: 'payment_schedule', label: 'Ödeme Planı', type: 'select', options: ['Peşin', '50% Başlangıç - 50% Teslim', 'Kilometre Taşı Bazlı', 'Haftalık', 'Teslimde'], required: true, section: 'Ödeme' },
      { id: 'deadline', label: 'Proje Teslim Tarihi', type: 'date', required: true, section: 'Süre' },
      { id: 'revision_count', label: 'Ücretsiz Revizyon Sayısı', type: 'number', required: false, section: 'Proje Detayları', defaultValue: 3 },
      { id: 'ip_transfer', label: 'Fikri Mülkiyet Devri', type: 'select', options: ['Tam devir (ödeme sonrası)', 'Lisans (kullanım hakkı)', 'Freelancer\'da kalır'], required: true, section: 'Haklar' },
      { id: 'jurisdiction', label: 'Yetkili Mahkeme', type: 'select', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'], required: true, section: 'Hukuki' },
      { id: 'special_clauses', label: 'Özel Maddeler', type: 'textarea', required: false, section: 'Ek Maddeler' },
    ],
    base_text: `FREELANCE HİZMET SÖZLEŞMESİ
(Bağımsız Yüklenici Sözleşmesi)

1. TARAFLAR

İşbu Sözleşme, bağımsız yüklenici sıfatıyla hizmet sunacak olan Freelancer ile İşveren arasında akdedilmiştir.

Freelancer (Bağımsız Yüklenici):
Ad Soyad: {{freelancer_name}}
Adres: {{freelancer_address}}
TC/Vergi No: {{freelancer_tax}}
IBAN: {{freelancer_iban}}

İşveren:
Ad/Ünvan: {{client_name}}
Adres: {{client_address}}
Vergi/TC No: {{client_tax}}

2. BAĞIMSIZ YÜKLENİCİ STATÜSÜ

2.1. Freelancer, işbu Sözleşme kapsamında 6098 sayılı Türk Borçlar Kanunu'nun eser sözleşmesine ilişkin hükümleri (m. 470-486) çerçevesinde bağımsız yüklenici sıfatıyla hareket etmekte olup, taraflar arasında 4857 sayılı İş Kanunu kapsamında bir işçi-işveren ilişkisi bulunmamaktadır.
2.2. Freelancer, 5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu kapsamındaki sosyal güvenlik yükümlülüklerini bizzat yerine getirecektir.
2.3. Freelancer, çalışma saatlerini, çalışma yerini ve yöntemini serbestçe belirler; İşveren'in bu konularda talimat verme yetkisi yoktur.
2.4. Freelancer, hizmeti bizzat ifa edecektir. Üçüncü kişilere devir için İşveren'in yazılı onayı gereklidir.

3. PROJE KAPSAMI

Proje Adı: {{project_name}}

Kapsam ve Yapılacak İşler:
{{project_scope}}

4. TESLİMAT TAKVİMİ

{{milestones}}

Son Teslim Tarihi: {{deadline}}

Teslim, İşveren'e e-posta veya kararlaştırılan kanal üzerinden yapılır. İşveren, teslimden itibaren 5 (beş) iş günü içinde kabul veya revizyon talebini bildirir.

5. ÜCRET VE ÖDEME

5.1. Toplam proje bedeli: {{project_fee}} TL (KDV hariç)
5.2. Ödeme planı: {{payment_schedule}}
5.3. Freelancer, serbest meslek makbuzu veya fatura düzenleyecektir.
5.4. Stopaj kesintisi: 193 sayılı Gelir Vergisi Kanunu'nun 94. maddesi uyarınca İşveren %20 stopaj kesintisi yapabilir (Freelancer'ın vergi mükellefiyet durumuna göre).
5.5. Ödeme, Freelancer'ın yukarıda belirtilen IBAN hesabına yapılır.
5.6. Geç ödemelere aylık %1,5 gecikme faizi uygulanır.

6. REVİZYON VE DEĞİŞİKLİKLER

6.1. {{revision_count}} adet ücretsiz revizyon hakkı mevcuttur.
6.2. Revizyon talepleri yazılı olarak bildirilir.
6.3. Kapsam dışı değişiklikler ayrıca ücretlendirilir ve ek süre gerektirebilir.
6.4. Ek talepler yazılı onay ile eklenebilir (scope change).

7. FİKRİ MÜLKİYET HAKLARI

7.1. Fikri mülkiyet düzenlemesi: {{ip_transfer}}
7.2. 5846 sayılı Fikir ve Sanat Eserleri Kanunu hükümleri saklıdır.
7.3. Freelancer, eser üzerindeki manevi haklarını (isim hakkı) her halükarda korur.
7.4. Devir öncesi Freelancer'ın mevcut araç, kütüphane ve know-how'ı Freelancer'da kalır.

8. GİZLİLİK

8.1. Taraflar, proje kapsamında edinilen tüm ticari ve teknik bilgileri gizli tutacaktır.
8.2. Gizlilik yükümlülüğü, Sözleşme'nin sona ermesinden sonra 2 (iki) yıl daha devam eder.
8.3. Freelancer, referans amaçlı kullanım için İşveren'in yazılı onayını alır.

9. GARANTİ VE SORUMLULUK

9.1. Freelancer, teslim edilen eserin özgün olduğunu ve üçüncü kişi haklarını ihlal etmediğini garanti eder.
9.2. Freelancer'ın sorumluluğu, toplam proje bedeli ile sınırlıdır.
9.3. Dolaylı, özel veya cezai zararlardan sorumluluk kabul edilmez.

10. FESİH

10.1. Taraflardan her biri, 10 (on) gün önceden yazılı bildirimde bulunarak Sözleşme'yi feshedebilir.
10.2. Fesih halinde, fesih tarihine kadar tamamlanan iş oranında ödeme yapılır.
10.3. İşveren'in haksız feshi halinde, proje bedelinin tamamı ödenir.

11. UYUŞMAZLIK

11.1. Taraflar uyuşmazlıkları öncelikle müzakere yoluyla çözmeye çalışır.
11.2. {{jurisdiction}} Mahkemeleri ve İcra Daireleri yetkilidir.
11.3. 6098 sayılı Türk Borçlar Kanunu hükümleri uygulanır.

{{special_clauses_section}}

İşbu Sözleşme, 2 (iki) nüsha olarak düzenlenmiş ve taraflarca okunarak imza altına alınmıştır.


Freelancer                                İşveren
{{freelancer_name}}                       {{client_name}}

İmza: _______________                     İmza: _______________
Tarih: ___/___/______                     Tarih: ___/___/______`,
  },

  // ── 4. Ortaklık Sözleşmesi ──────────────────────────────
  {
    id: 'partnership',
    title: 'Ortaklık Sözleşmesi',
    icon: '🤝',
    description: 'Adi ortaklık veya iş ortaklığı kurulumu için.',
    category: 'Ortaklık',
    is_popular: 0,
    sort_order: 4,
    fields_schema: [
      { id: 'partner1_name', label: '1. Ortak (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'partner1_address', label: '1. Ortak Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'partner1_tax', label: '1. Ortak Vergi/TC No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'partner1_share', label: '1. Ortak Pay Oranı (%)', type: 'number', required: true, section: 'Ortaklık Yapısı', defaultValue: 50 },
      { id: 'partner2_name', label: '2. Ortak (Ad Soyad / Ünvan)', type: 'text', required: true, section: 'Taraflar' },
      { id: 'partner2_address', label: '2. Ortak Adresi', type: 'textarea', required: true, section: 'Taraflar' },
      { id: 'partner2_tax', label: '2. Ortak Vergi/TC No', type: 'text', required: true, section: 'Taraflar' },
      { id: 'partner2_share', label: '2. Ortak Pay Oranı (%)', type: 'number', required: true, section: 'Ortaklık Yapısı', defaultValue: 50 },
      { id: 'partnership_name', label: 'Ortaklık / İş Adı', type: 'text', required: true, section: 'Ortaklık Detayları' },
      { id: 'partnership_purpose', label: 'Ortaklığın Faaliyet Konusu', type: 'textarea', required: true, section: 'Ortaklık Detayları' },
      { id: 'initial_capital', label: 'Başlangıç Sermayesi (₺)', type: 'number', required: true, section: 'Sermaye' },
      { id: 'profit_distribution', label: 'Kâr Dağıtım Periyodu', type: 'select', options: ['Aylık', '3 Aylık', '6 Aylık', 'Yıllık'], required: true, section: 'Sermaye' },
      { id: 'management', label: 'Yönetim Yetkisi', type: 'select', options: ['Müşterek (Birlikte)', '1. Ortak Yetkili', '2. Ortak Yetkili', 'Dönüşümlü'], required: true, section: 'Yönetim' },
      { id: 'exit_notice', label: 'Çıkış İhbar Süresi (Ay)', type: 'number', required: true, section: 'Çıkış', defaultValue: 3 },
      { id: 'jurisdiction', label: 'Yetkili Mahkeme', type: 'select', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'], required: true, section: 'Hukuki' },
      { id: 'special_clauses', label: 'Özel Maddeler', type: 'textarea', required: false, section: 'Ek Maddeler' },
    ],
    base_text: `ADİ ORTAKLIK SÖZLEŞMESİ

1. TARAFLAR

İşbu Adi Ortaklık Sözleşmesi, 6098 sayılı Türk Borçlar Kanunu'nun 620-645. maddeleri çerçevesinde aşağıdaki taraflar arasında akdedilmiştir.

1. Ortak:
Ad/Ünvan: {{partner1_name}}
Adres: {{partner1_address}}
Vergi/TC No: {{partner1_tax}}
Ortaklık Payı: %{{partner1_share}}

2. Ortak:
Ad/Ünvan: {{partner2_name}}
Adres: {{partner2_address}}
Vergi/TC No: {{partner2_tax}}
Ortaklık Payı: %{{partner2_share}}

2. ORTAKLIĞIN ADI VE KONUSU

2.1. Ortaklık Adı: {{partnership_name}}
2.2. Faaliyet Konusu: {{partnership_purpose}}
2.3. Adi ortaklığın tüzel kişiliği yoktur; ortaklar kendi adlarına hareket eder.

3. SERMAYE

3.1. Ortaklığın toplam başlangıç sermayesi {{initial_capital}} TL'dir.
3.2. 1. Ortak sermaye katkısı: %{{partner1_share}} oranında
3.3. 2. Ortak sermaye katkısı: %{{partner2_share}} oranında
3.4. Sermaye katkıları, Sözleşme'nin imzalanmasından itibaren 15 (on beş) gün içinde ortaklık hesabına yatırılacaktır.
3.5. Sermaye artırımı veya azaltımı, ortakların oybirliği ile kararlaştırılır.
3.6. Nakit dışı sermaye katkıları (emek, know-how, ekipman) ayrıca değerlenerek belirlenir.

4. KÂR VE ZARAR DAĞILIMI

4.1. Kâr ve zarar, ortaklık payları oranında dağıtılır.
4.2. Kâr dağıtım periyodu: {{profit_distribution}}
4.3. Kâr dağıtımı, ortaklık giderleri ve yedek akçe ayrıldıktan sonra yapılır.
4.4. Zarar halinde ortaklar, payları oranında sorumludur (TBK m. 623).
4.5. Ortaklık hesapları ve defterleri düzenli tutulur; her ortak inceleme hakkına sahiptir.

5. YÖNETİM VE TEMSİL

5.1. Yönetim yetkisi: {{management}}
5.2. Olağan işler yönetici ortak(lar) tarafından yürütülür.
5.3. Aşağıdaki kararlar ortakların oybirliği ile alınır:
   a) Toplam sermayenin %10'unu aşan borçlanma
   b) Taşınmaz alım-satımı
   c) Yeni ortak alımı
   d) Ortaklık konusunun değiştirilmesi
   e) Tasfiye kararı

6. ORTAKLARIN YÜKÜMLÜLÜKLERİ

6.1. Ortaklar, TBK m. 626 uyarınca rekabet yasağına uyacaktır.
6.2. Ortaklar, ortaklık işlerinde basiretli bir iş insanı gibi davranacaktır.
6.3. Ortaklar, ortaklığa ait bilgileri gizli tutacak, üçüncü kişilerle paylaşmayacaktır.
6.4. Ortaklar, kişisel harcamalarını ortaklık hesabından karşılayamaz.

7. ORTAKLIKTAN ÇIKIŞ VE ÇIKARMA

7.1. Çıkış: Çıkmak isteyen ortak, {{exit_notice}} ay önceden yazılı bildirimde bulunmalıdır.
7.2. Çıkan ortağın payı, çıkış tarihindeki güncel değerleme üzerinden hesaplanarak 60 (altmış) gün içinde ödenir.
7.3. Diğer ortak(lar)ın ön alım hakkı mevcuttur (30 gün içinde kullanılmalıdır).
7.4. Çıkarma: Haklı sebeplerin varlığı halinde, diğer ortakların talebiyle mahkeme kararıyla çıkarma yapılabilir (TBK m. 633).

8. ORTAKLIĞIN SONA ERMESİ

8.1. Ortaklık aşağıdaki hallerde sona erer:
   a) Ortakların oybirliği ile karar alması
   b) Ortaklık amacının gerçekleşmesi veya gerçekleşmesinin imkânsız hale gelmesi
   c) Mahkeme kararı
   d) Tüm ortakların ayrılması
8.2. Tasfiye halinde: Önce borçlar ödenir, kalan varlıklar ortaklık payları oranında paylaşılır.
8.3. Tasfiye memuru, ortakların mutabakatı ile belirlenir.

9. MÜCBİR SEBEPLER

Doğal afet, savaş, salgın, yasal değişiklik gibi tarafların kontrolü dışındaki olaylar mücbir sebep sayılır. Mücbir sebep süresince yükümlülükler askıya alınır.

10. UYUŞMAZLIK

10.1. Taraflar, uyuşmazlıkları öncelikle müzakere ve arabuluculuk yoluyla çözmeye çalışır.
10.2. {{jurisdiction}} Mahkemeleri ve İcra Daireleri yetkilidir.
10.3. 6098 sayılı Türk Borçlar Kanunu hükümleri uygulanır.

{{special_clauses_section}}

İşbu Sözleşme, 2 (iki) nüsha olarak düzenlenmiş ve taraflarca okunarak imza altına alınmıştır.


1. Ortak                                  2. Ortak
{{partner1_name}}                         {{partner2_name}}

İmza: _______________                     İmza: _______________
Tarih: ___/___/______                     Tarih: ___/___/______`,
  },
];

module.exports = { TEMPLATES };
