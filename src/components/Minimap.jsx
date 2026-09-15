'use client';

import { Map as MapIcon, Minus } from 'lucide-react';
import { cn } from '@/src/lib/cn';

/**
 * Denah 2D lantai aktif. Koordinat ruangan dalam persen sehingga
 * gambar ikut menyesuaikan ukuran kartu tanpa perhitungan piksel.
 */
export default function Minimap({ plan, activeId, open, onToggle, onNavigate }) {
  if (!plan) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="pointer-events-auto flex items-center gap-2 rounded-lg bg-[#0E2A47]/95 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg ring-1 ring-white/10 hover:bg-[#2B6CB0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
      >
        <MapIcon className="size-4 text-[#E2762B]" aria-hidden="true" />
        Denah
      </button>
    );
  }

  return (
    <section
      aria-label="Denah lantai aktif"
      className="pointer-events-auto w-56 overflow-hidden rounded-lg bg-[#0E2A47]/95 shadow-xl ring-1 ring-white/10 sm:w-64"
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <h2 className="flex min-w-0 items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-white">
          <MapIcon className="size-3.5 shrink-0 text-[#E2762B]" aria-hidden="true" />
          <span className="truncate">{plan.name}</span>
        </h2>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Sembunyikan denah"
          className="grid size-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div className="px-3 pb-1 pt-2">
        <div className="relative aspect-[4/3] w-full rounded border border-white/10 bg-[#0E2A47]">
          {plan.rooms.map((r) => {
            const aktif = r.id === activeId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onNavigate(r.id)}
                aria-current={aktif ? 'true' : undefined}
                title={r.label}
                style={{
                  left: `${r.x}%`,
                  top: `${r.y}%`,
                  width: `${r.w}%`,
                  height: `${r.h}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={cn(
                  'absolute grid place-items-center overflow-hidden rounded-sm border text-[0.55rem] font-semibold leading-tight transition',
                  aktif
                    ? 'z-10 border-[#E2762B] bg-[#E2762B]/30 text-white'
                    : 'border-white/20 bg-white/5 text-slate-400 hover:border-white/50 hover:bg-white/10 hover:text-white'
                )}
              >
                <span className="truncate px-0.5">{r.label}</span>

                {/* Titik lokasi penampil, berdenyut agar mudah ditemukan. */}
                {aktif && (
                  <span className="absolute bottom-0.5 right-0.5 flex size-2.5" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#E2762B] opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-[#E2762B] ring-1 ring-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="px-3 pb-2 pt-1 text-[0.6rem] text-slate-500">Ketuk ruangan untuk berpindah.</p>
    </section>
  );
}
