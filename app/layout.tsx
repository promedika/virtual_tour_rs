import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tur Virtual 360° Rumah Sakit | PT. Global Promedika Services',
  description:
    'Jelajahi gedung, lantai, dan ruangan rumah sakit dalam tampilan 360°, lengkap dengan data alat medis dan riwayat kalibrasi.',
  applicationName: 'PT. Global Promedika Services',
  // Logo perusahaan dipakai untuk tab peramban, pintasan layar utama, dan penanda.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '256x256' },
      { url: '/logo-gps.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo-gps.png',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
