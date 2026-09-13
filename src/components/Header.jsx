'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, Check, ChevronDown, ChevronRight, LayoutDashboard, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { daftarRumahSakit } from '@/src/data/hospitalData';
import { cn } from '@/src/lib/cn';

/** Pemilih rumah sakit. Menutup sendiri saat klik di luar atau tombol Esc. */
function PemilihRumahSakit({ aktif, onPilih }) {
  const [buka, setBuka] = useState(false);
  const kotak = useRef(null);

  useEffect(() => {
    if (!buka) return;
    const klikLuar = (e) => {
      if (!kotak.current?.contains(e.target)) setBuka(false);
    };
    const tekanEsc = (e) => {
      if (e.key === 'Escape') setBuka(false);
    };
    document.addEventListener('pointerdown', klikLuar);
    document.addEventListener('keydown', tekanEsc);
    return () => {
      document.removeEventListener('pointerdown', klikLuar);
      document.removeEventListener('keydown', tekanEsc);
    };
  }, [buka]);

  return (
    <div ref={kotak} className="relative min-w-0 flex-1 sm:max-w-[17rem] sm:flex-none">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        aria-haspopup="listbox"
        className="flex min-w-0 items-center gap-1.5 rounded-md bg-white/10 px-1.5 py-1 text-left transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B] sm:px-2.5 sm:py-1.5"
      >
        <Building2 className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
        {/* Nama rumah sakit tidak pernah dipotong: di layar sempit ia boleh
            membungkus dua baris dengan huruf lebih kecil. */}
        <span className="min-w-0 flex-1">
          <span className="block text-[0.7rem] font-bold leading-tight text-white sm:text-sm">{aktif.nama}</span>
          <span className="hidden text-[0.6rem] leading-tight text-slate-400 sm:block">{aktif.wilayah}</span>
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition', buka && 'rotate-180')} aria-hidden="true" />
      </button>

      {buka && (
        <ul
          role="listbox"
          aria-label="Pilih rumah sakit"
          className="absolute left-0 top-full z-50 mt-1 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-lg bg-[#13263D] py-1 shadow-2xl ring-1 ring-white/15"
        >
          {daftarRumahSakit.map((rs) => {
            const terpilih = rs.id === aktif.id;
            return (
              <li key={rs.id} role="option" aria-selected={terpilih}>
                <button
                  type="button"
                  onClick={() => {
                    setBuka(false);
                    if (!terpilih) onPilih(rs.id);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left transition',
                    terpilih ? 'bg-[#E2762B]/20' : 'hover:bg-white/10'
                  )}
                >
                  <Building2 className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{rs.nama}</span>
                    <span className="block text-xs text-slate-400">{rs.wilayah}</span>
                  </span>
                  {terpilih && <Check className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Bilah atas: tombol panel, pemilih rumah sakit, jejak navigasi,
 * tombol kembali ke dasbor, dan identitas perusahaan.
 * Jejak navigasi dapat digulir mendatar pada layar sempit.
 */
export default function Header({ rsAktif, trail, onOpenDrawer, onGantiRumahSakit, onNavigate }) {
  return (
    // z-50 menempatkan bilah ini di atas panel kiri, sehingga daftar pilihan
    // rumah sakit terbuka utuh dan tidak terpotong oleh panel navigasi.
    <header className="relative z-50 flex h-16 shrink-0 items-center gap-1.5 bg-[#13263D] px-1.5 text-white ring-1 ring-white/10 sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Buka panel navigasi"
        className="grid size-8 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B] sm:size-9 md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Identitas perusahaan di kiri atas. Alas putih menjaga logo tetap tajam
          di atas bilah gelap maupun latar terang. */}
      <Link
        href="/"
        aria-label="Beranda PT. Global Promedika Services"
        className="flex shrink-0 items-center rounded-md bg-white px-1.5 py-1 shadow-sm ring-1 ring-white/20 transition hover:ring-[#E2762B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B] sm:px-2"
      >
        <Image
          src="/logo-gps.png"
          alt="PT. Global Promedika Services"
          width={578}
          height={400}
          priority
          className="h-7 w-auto object-contain sm:h-10"
        />
      </Link>

      {/* Judul aplikasi, tepat di tengah bilah. */}
      <p className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-sm font-bold uppercase tracking-[0.22em] text-white lg:block">
        Rumah Sakit Virtual Tour
      </p>

      <PemilihRumahSakit aktif={rsAktif} onPilih={onGantiRumahSakit} />

      {/* Jejak: Nama Rumah Sakit > Gedung > Lantai > Ruangan. */}
      <nav aria-label="Jejak navigasi" className="hidden min-w-0 flex-1 2xl:block">
        <ol className="flex items-center gap-1 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="flex shrink-0 items-center gap-1">
            <span className="truncate text-slate-400">{rsAktif.nama}</span>
          </li>
          {trail.map((s, i) => {
            const terakhir = i === trail.length - 1;
            return (
              <li key={s.id} className="flex shrink-0 items-center gap-1">
                <ChevronRight className="size-3.5 shrink-0 text-slate-600" aria-hidden="true" />
                {terakhir ? (
                  <span aria-current="page" className="font-semibold text-white">
                    {s.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate(s.id)}
                    className="rounded px-1 text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
                  >
                    {s.name}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Ruangan aktif, ditampilkan saat jejak navigasi tidak muat. */}
      <p className="ml-auto hidden min-w-0 truncate text-sm font-semibold text-slate-300 lg:block 2xl:hidden">
        {trail.at(-1)?.name}
      </p>

      {/* Di layar sempit hanya ikon yang tampil agar bilah tidak meluber;
          nama tujuan tetap terbaca pembaca layar lewat aria-label. */}
      <Link
        href="/"
        aria-label="Kembali ke Dashboard"
        className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md bg-[#E2762B] p-2 text-xs font-bold text-white transition hover:bg-[#c9641f] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-2.5 sm:text-sm lg:ml-0"
      >
        <LayoutDashboard className="size-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Kembali ke Dashboard</span>
      </Link>
    </header>
  );
}

