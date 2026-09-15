import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GridScan Smart Asset Tracking',
  description:
    'Penelusuran aset rumah sakit dalam tampilan 360°, lengkap dengan data alat medis dan riwayat kalibrasi.',
  applicationName: 'GridScan Smart Asset Tracking',
  // Ikon tab peramban dan pintasan layar utama diambil otomatis dari
  // app/icon.png serta app/apple-icon.png, jadi tidak perlu didaftarkan di sini.
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
