'use client';

import { Info, Map as MapIcon, Maximize, Minimize, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/src/lib/cn';

/** Satu tombol bulat pada bilah kendali bawah. */
function Aksi({ icon: Icon, label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      className={cn(
        'grid size-11 place-items-center rounded-full text-slate-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]',
        active ? 'bg-[#E2762B] text-white' : 'hover:bg-white/15 hover:text-white'
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * Bilah aksi cepat di bawah penampil: layar penuh, atur ulang arah pandang,
 * tampilkan denah, dan keterangan ruangan.
 */
export default function ControlBar({ onReset, onToggleMap, mapOpen, onToggleSummary, summaryOpen, targetRef }) {
  const [fullscreen, setFullscreen] = useState(false);

  // Status layar penuh disinkronkan dari peramban agar tombol tetap tepat
  // walau pengguna keluar dengan tombol Esc.
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = () => {
    const el = targetRef?.current ?? document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-[#13263D]/95 px-2 py-1.5 shadow-xl ring-1 ring-white/10">
      <Aksi
        icon={fullscreen ? Minimize : Maximize}
        label={fullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
        onClick={toggleFullscreen}
      />
      <Aksi icon={RotateCcw} label="Atur ulang arah pandang" onClick={onReset} />
      <Aksi icon={MapIcon} label="Tampilkan atau sembunyikan denah" onClick={onToggleMap} active={mapOpen} />
      <Aksi icon={Info} label="Tampilkan atau sembunyikan ringkasan" onClick={onToggleSummary} active={summaryOpen} />
    </div>
  );
}
