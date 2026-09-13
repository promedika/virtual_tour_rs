'use client';

import { GripHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/src/lib/cn';

/**
 * Pembungkus panel yang dapat digeser pengguna memakai gagang di sudutnya,
 * sehingga panel apa pun bisa dipindahkan bila menghalangi pandangan 360°.
 *
 * Letak awal tetap ditentukan kelas posisi dari pemanggil; komponen ini hanya
 * menambahkan simpangan (translate) dan menjaga panel tidak pernah keluar
 * layar. Klik ganda pada gagang mengembalikan panel ke letak awalnya.
 */
export default function PanelGeser({ className, gagangKelas, gagang = true, label = 'Geser panel', children }) {
  const [geser, setGeser] = useState({ x: 0, y: 0 });
  const kotak = useRef(null);
  const seret = useRef(null);

  const mulai = (e) => {
    const el = kotak.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    // Batas simpangan dihitung dari letak panel saat ini agar panel selalu
    // tersisa di dalam jendela, berapa pun ukuran layarnya.
    seret.current = {
      x: e.clientX - geser.x,
      y: e.clientY - geser.y,
      min: { x: geser.x - r.left + 8, y: geser.y - r.top + 8 },
      maks: { x: geser.x + (window.innerWidth - r.right) - 8, y: geser.y + (window.innerHeight - r.bottom) - 8 },
    };
  };

  const pindah = (e) => {
    const s = seret.current;
    if (!s) return;
    setGeser({
      x: Math.min(s.maks.x, Math.max(s.min.x, e.clientX - s.x)),
      y: Math.min(s.maks.y, Math.max(s.min.y, e.clientY - s.y)),
    });
  };

  const selesai = () => {
    seret.current = null;
  };

  return (
    <div
      ref={kotak}
      className={cn('pointer-events-none', className)}
      style={{ transform: `translate(${geser.x}px, ${geser.y}px)` }}
    >
      {children}
      {gagang && (
      <button
        type="button"
        onPointerDown={mulai}
        onPointerMove={pindah}
        onPointerUp={selesai}
        onPointerCancel={selesai}
        onDoubleClick={() => setGeser({ x: 0, y: 0 })}
        aria-label={`${label} (klik ganda untuk mengembalikan)`}
        title={`${label} — klik ganda untuk mengembalikan`}
        className={cn(
          'pointer-events-auto absolute -top-2 right-2 grid h-5 w-9 touch-none cursor-grab place-items-center',
          'rounded-full bg-[#1E3A5F] text-slate-300 shadow ring-1 ring-white/20 active:cursor-grabbing',
          'hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]',
          gagangKelas
        )}
      >
        <GripHorizontal className="size-3.5" aria-hidden="true" />
      </button>
      )}
    </div>
  );
}
