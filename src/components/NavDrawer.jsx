'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, ChevronDown, ChevronRight, DoorOpen, Layers, Stethoscope, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/cn';

/**
 * Panel navigasi gelap dengan pohon lipat: Gedung â†’ Lantai â†’ Ruangan â†’ Alat.
 * Sekaligus padanan hotspot yang dapat dijangkau papan ketik dan pembaca layar,
 * karena penanda di kanvas WebGL tidak masuk urutan fokus dokumen.
 */
export default function NavDrawer({ tree, activeId, activeTrail, open, onClose, onNavigate, onSelect }) {
  // Cabang yang dibuka manual; cabang pada jalur scene aktif selalu terbuka.
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isOpen = (id) => expanded.has(id) || activeTrail.includes(id);

  return (
    <>
      {/* Lapisan gelap khusus tampilan ponsel saat panel terbuka. */}
      {open && (
        <button
          type="button"
          aria-label="Tutup panel navigasi"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/60 md:hidden"
        />
      )}

      <aside
        aria-label="Navigasi area rumah sakit"
        className={cn(
          // z-40: di bawah bilah atas (z-50) agar daftar rumah sakit tidak terpotong.
          'z-40 flex w-72 shrink-0 flex-col bg-[#13263D] text-slate-200',
          'fixed inset-y-0 left-0 transition-transform duration-200 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#E2762B] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            Kembali ke Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Layers className="size-4 text-[#E2762B]" aria-hidden="true" />
            Navigasi Area
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel navigasi"
            className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B] md:hidden"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {tree.map((gedung) => (
            <div key={gedung.id}>
              <p className="flex items-center gap-2 px-2 py-2 text-sm font-bold text-white">
                <Building2 className="size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
                {gedung.label}
              </p>
              <ul className="space-y-0.5">
                {gedung.floors.map((lantai) => (
                  <FloorNode
                    key={lantai.id}
                    lantai={lantai}
                    open={isOpen(lantai.id)}
                    activeId={activeId}
                    onToggle={toggle}
                    onNavigate={onNavigate}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="border-t border-white/10 px-4 py-3 text-[0.7rem] leading-relaxed text-slate-500">
          Pilih lantai atau ruangan untuk berpindah. Alat pada ruangan aktif dapat dibuka dari daftar ini.
        </p>
      </aside>
    </>
  );
}

/** Satu cabang lantai beserta daftar ruangan dan alatnya. */
function FloorNode({ lantai, open, activeId, onToggle, onNavigate, onSelect }) {
  const aktif = activeId === lantai.id;
  return (
    <li>
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => onToggle(lantai.id)}
          aria-expanded={open}
          aria-label={`${open ? 'Tutup' : 'Buka'} daftar ruangan ${lantai.label}`}
          className="grid w-7 shrink-0 place-items-center rounded-l-md text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
        >
          {open ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronRight className="size-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => onNavigate(lantai.id)}
          aria-current={aktif ? 'true' : undefined}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-r-md px-2 py-2 text-left text-sm font-semibold transition',
            aktif ? 'bg-[#E2762B] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
          )}
        >
          <Layers className="size-4 shrink-0 opacity-70" aria-hidden="true" />
          <span className="truncate">{lantai.label}</span>
        </button>
      </div>

      {open && lantai.rooms.length > 0 && (
        <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
          {lantai.rooms.map((ruang) => (
            <RoomNode
              key={ruang.id}
              ruang={ruang}
              aktif={activeId === ruang.id}
              onNavigate={onNavigate}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Ruangan; daftar alat hanya dibentangkan untuk ruangan yang sedang dilihat. */
function RoomNode({ ruang, aktif, onNavigate, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onNavigate(ruang.id)}
        aria-current={aktif ? 'true' : undefined}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition',
          aktif ? 'bg-[#E2762B] font-semibold text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
        )}
      >
        <DoorOpen className="size-4 shrink-0 opacity-70" aria-hidden="true" />
        <span className="truncate">{ruang.label}</span>
      </button>

      {aktif && ruang.equipment.length > 0 && (
        <ul className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">
          {ruang.equipment.map((alat) => (
            <li key={alat.ref}>
              <button
                type="button"
                onClick={() => onSelect(alat.ref)}
                className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
              >
                <Stethoscope className="mt-0.5 size-3.5 shrink-0 text-[#E2762B]" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-200">{alat.AlatNama}</span>
                  <span className="block truncate">{alat.LabelNoBaru}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

