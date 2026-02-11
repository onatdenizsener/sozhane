import './globals.css';

export const metadata = {
  title: 'Sözhane — Türkçe Hukuki Sözleşme Otomasyonu',
  description: 'AI destekli, Türk hukukuna uygun sözleşmeler dakikalar içinde. NDA, Hizmet, Freelance ve Ortaklık sözleşmeleri.',
  keywords: 'sözleşme, hukuk, NDA, freelance, hizmet sözleşmesi, türk hukuku, AI, otomasyon',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
