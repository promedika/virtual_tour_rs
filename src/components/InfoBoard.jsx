'use client';

import Image from 'next/image';
import { CalendarClock, ChevronDown, DoorOpen, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/cn';
import { jatuhTempoKalibrasi } from '@/src/data/hospitalData';

/** Ubah '2026-07-01' menjadi '1 Juli 2026'. */
function tanggalPanjang(iso) {
  if (!iso) return 'Belum dijadwalkan';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Belum dijadwalkan';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Jatuh tempo terdekat di antara seluruh alat pada area ini. */
function tempoTerdekat(daftar) {
  return daftar.map(jatuhTempoKalibrasi).filter(Boolean).sort()[0] ?? null;
}

/** Daftar alat pada area ini; tiap baris membuka rincian alat. */
function DaftarAlat({ equipment, onSelect }) {
  if (equipment.length === 0) return null;
  return (
    <>
      <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">Alat di area ini</p>
      <ul className="mb-3 space-y-1">
        {equipment.map((alat) => (
          <li key={alat.ref}>
            <button
              type="button"
              onClick={() => onSelect(alat.ref)}
              className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-[#2B6CB0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
            >
              <Image
                src={alat.equipmentImage}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-md object-cover ring-1 ring-white/10"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-white">{alat.AlatNama}</span>
                <span className="block truncate text-[0.65rem] text-slate-400">
                  {alat.AlatMerk} {alat.AlatTipe}
                </span>
              </span>
              <span
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase',
                  alat.Keterangan === 'LAIK PAKAI'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-amber-500/15 text-amber-300'
                )}
              >
                {alat.Keterangan === 'LAIK PAKAI' ? 'Laik' : 'Periksa'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Tujuan perpindahan dari area ini: lantai lain, ruangan, atau kembali. */
function DaftarTujuan({ tujuan, onNavigate }) {
  if (tujuan.length === 0) return null;
  return (
    <>
      <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">Tujuan</p>
      <ul className="space-y-1">
        {tujuan.map((t) => (
          <li key={t.to}>
            <button
              type="button"
              onClick={() => onNavigate(t.to)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-white transition hover:bg-[#2B6CB0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
            >
              <DoorOpen className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
              <span className="truncate">{t.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Papan informasi area: satu tempat untuk seluruh isi ruangan, menggantikan
 * penanda yang dulu tersebar di dalam panorama.
 *
 * Papan berada di lapisan antarmuka, bukan di dalam kanvas, sehingga tetap
 * terlihat sepenuhnya ketika panorama diputar atau digeser. Letaknya dapat
 * dipindahkan pengguna lewat pembungkus PanelGeser, sama seperti denah.
 */
export default function InfoBoard({ scene, equipment, tujuan, open, onToggle, onSelect, onNavigate }) {
  const laik = equipment.filter((a) => a.Keterangan === 'LAIK PAKAI').length;
  const tempo = tempoTerdekat(equipment);

  if (!open) return null;

  return (
    <section
      aria-label={`Papan informasi ${scene.name}`}
      className={cn(
        // Lebar mengikuti layar dengan batas atas, sehingga papan tetap utuh
        // dari 360px sampai monitor lebar tanpa aturan titik-henti terpisah.
        'pointer-events-auto flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl',
        'max-h-[min(60vh,calc(100dvh-13rem))] lg:max-h-[calc(100dvh-9rem)]',
        'bg-[#0E2A47]/95 text-slate-200 shadow-xl ring-1 ring-[#2B6CB0] backdrop-blur'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Sembunyikan papan informasi"
        className="flex w-full shrink-0 items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E2762B]"
      >
        <MapPin className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">
            {scene.building ?? 'Area'}
          </span>
          <span className="block truncate text-sm font-bold text-white">{scene.name}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 rotate-180 text-slate-400" aria-hidden="true" />
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/10 px-3 pb-3 pt-2.5">
        <dl className="mb-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-white/5 px-2 py-2">
            <dt className="text-[0.6rem] uppercase tracking-wide text-slate-400">Jumlah Alat</dt>
            <dd className="text-lg font-bold text-white">{equipment.length}</dd>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-2">
            <dt className="text-[0.6rem] uppercase tracking-wide text-slate-400">Laik Pakai</dt>
            <dd className="text-lg font-bold text-emerald-400">
              {laik}
              <span className="text-xs font-medium text-slate-400">/{equipment.length}</span>
            </dd>
          </div>
        </dl>

        <p className="mb-3 flex items-start gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-[0.7rem] leading-relaxed">
          <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-[#E2762B]" aria-hidden="true" />
          <span>
            <span className="block text-slate-400">Kalibrasi berikutnya</span>
            <span className="font-semibold text-white">{tanggalPanjang(tempo)}</span>
          </span>
        </p>

        <DaftarAlat equipment={equipment} onSelect={onSelect} />
        <DaftarTujuan tujuan={tujuan} onNavigate={onNavigate} />

        {equipment.length === 0 && tujuan.length === 0 && (
          <p className="text-[0.7rem] text-slate-400">Belum ada data untuk area ini.</p>
        )}
      </div>
    </section>
  );
}
