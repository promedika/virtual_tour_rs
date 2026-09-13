'use client';

import Image from 'next/image';
import { CalendarClock, ChevronDown, ClipboardList, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/cn';
import { jatuhTempoKalibrasi } from '@/src/data/hospitalData';

/** Ubah '2026-07-01' menjadi '1 Juli 2026'. */
function tanggalPanjang(iso) {
  if (!iso) return 'Belum dijadwalkan';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Belum dijadwalkan';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Jatuh tempo terdekat di antara seluruh alat pada ruangan ini. */
function tempoTerdekat(daftar) {
  const tanggal = daftar.map(jatuhTempoKalibrasi).filter(Boolean).sort();
  return tanggal[0] ?? null;
}

/**
 * Ringkasan lokasi dan alat. Tertutup secara bawaan; dibuka lewat tombol info
 * pada bilah kendali bawah. Di ponsel tampil sebagai lembar bawah selebar layar,
 * pada layar lebar sebagai kartu di pojok kanan atas.
 */
export default function SummaryPanel({ scene, equipment, open, onToggle, onSelect }) {
  const layak = equipment.filter((a) => a.Keterangan === 'LAIK PAKAI').length;
  const tempo = tempoTerdekat(equipment);

  if (!open) return null;

  return (
    <section
      className={cn(
        // Tinggi dibatasi agar lembar atas di ponsel berhenti jauh di atas
        // bilah kendali bawah, apa pun panjang daftar alatnya.
        'pointer-events-auto flex max-h-[calc(100dvh-15rem)] w-full flex-col overflow-hidden rounded-xl transition-all duration-300',
        // Batas tinggi di layar lebar menyisakan ruang tetap bagi denah di kanan bawah,
        // sehingga kedua kartu tersusun tanpa pernah bertumpuk.
        'lg:max-h-[calc(100dvh-23rem)] lg:w-[19rem]',
        'bg-[#13263D]/95 text-slate-200 shadow-xl ring-1 ring-white/10 backdrop-blur'
      )}
      aria-label="Ringkasan lokasi dan alat"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Tutup ringkasan"
        className="flex w-full shrink-0 items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E2762B]"
      >
        <MapPin className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">
            Ringkasan Lokasi
          </span>
          <span className="block truncate text-sm font-bold uppercase tracking-wide text-white">{scene.name}</span>
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
                {layak}
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

          {equipment.length > 0 ? (
            <>
              <p className="mb-1.5 flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">
                <ClipboardList className="size-3.5" aria-hidden="true" />
                Alat di ruangan ini
              </p>
              <ul className="space-y-1">
                {equipment.map((alat) => (
                  <li key={alat.ref}>
                    <button
                      type="button"
                      onClick={() => onSelect(alat.ref)}
                      className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
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
          ) : (
            <p className="text-[0.7rem] text-slate-400">
              Belum ada alat terdaftar di area ini. Pilih ruangan untuk melihat daftar alat.
            </p>
          )}
      </div>
    </section>
  );
}
