'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { calibrationHistory, jatuhTempoKalibrasi } from '@/src/data/hospitalData';
import { cn } from '@/src/lib/cn';

const TABS = [
  { id: 'detail', label: 'Detail' },
  { id: 'kalibrasi', label: 'Riwayat Kalibrasi' },
  { id: 'maintenance', label: 'Riwayat Maintenance' },
];

const tanggal = (iso) => {
  if (!iso) return 'Belum dijadwalkan';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Belum dijadwalkan';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Rincian alat dalam <dialog> bawaan peramban: perangkap fokus,
 * tombol Esc, dan lapisan latar sudah ditangani peramban.
 * Status buka/tutup dikendalikan prop `item`, bukan state internal,
 * sehingga modal dapat dibuka dan ditutup berulang kali tanpa tersangkut.
 */
export default function EquipmentModal({ item, onClose }) {
  const ref = useRef(null);
  const [tab, setTab] = useState('detail');

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (item && !dlg.open) {
      setTab('detail'); // selalu mulai dari tab pertama
      dlg.showModal();
    } else if (!item && dlg.open) {
      dlg.close();
    }
  }, [item]);

  if (!item) return null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Sasaran klik berupa elemen dialog itu sendiri berarti mengenai lapisan latar.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="judul-alat"
      className={cn(
        // m-auto menaruh dialog tepat di tengah layar; tinggi dibatasi 85vh dan
        // isi digulir di dalamnya agar modal tidak pernah terpotong tepi layar.
        'm-auto flex max-h-[85vh] w-[min(44rem,92vw)] flex-col overflow-hidden rounded-xl bg-white p-0 text-slate-800 shadow-2xl',
        'backdrop:bg-slate-950/70 open:animate-[munculModal_180ms_ease-out]'
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 bg-[#13263D] px-5 py-4 text-white">
        <div className="min-w-0">
          <h2 id="judul-alat" className="truncate text-lg font-bold">
            {item.AlatNama}
          </h2>
          <p className="truncate text-xs text-slate-300">
            {item.AlatMerk} · {item.AlatTipe}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup rincian alat"
          className="grid size-9 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <figure className="m-0">
          <div className="relative aspect-[4/3] w-full bg-slate-100 sm:aspect-[16/7]">
            <Image
              src={item.equipmentImage}
              alt={`Foto ${item.AlatNama}`}
              fill
              sizes="(max-width: 640px) 92vw, 44rem"
              className="object-cover"
            />
          </div>
          {/* Sebagian foto berlisensi CC BY/CC BY-SA sehingga atribusi wajib ditampilkan. */}
          <figcaption className="border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-center text-[0.65rem] text-slate-500">
            Image credit: {item.imageCredit}
          </figcaption>
        </figure>

        <div role="tablist" aria-label="Bagian rincian alat" className="flex gap-1 border-b border-slate-200 px-3 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-t-md px-3 py-2 text-xs font-semibold transition sm:text-sm',
                tab === t.id
                  ? 'border-b-2 border-[#E2762B] text-[#13263D]'
                  : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'detail' && <PanelDetail item={item} />}
          {tab === 'kalibrasi' && <PanelKalibrasi rows={calibrationHistory[item.ref] ?? []} />}
          {tab === 'maintenance' && <PanelPerawatan rows={item.maintenance ?? []} />}
        </div>
      </div>
    </dialog>
  );
}

function Baris({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-44">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function PanelDetail({ item }) {
  return (
    <dl role="tabpanel" id="panel-detail" aria-labelledby="tab-detail" className="text-slate-700">
      <Baris label="Nama Alat">{item.AlatNama}</Baris>
      <Baris label="Merk">{item.AlatMerk}</Baris>
      <Baris label="Tipe">{item.AlatTipe}</Baris>
      <Baris label="Nomor Seri">{item.AlatSeri}</Baris>
      <Baris label="Nomor Label">{item.LabelNoBaru}</Baris>
      <Baris label="Barcode">{item.Barcode}</Baris>
      <Baris label="Ruangan">{item.KalibRoom}</Baris>
      <Baris label="Kalibrasi Terakhir">{tanggal(item.KalibDate)}</Baris>
      <Baris label="Calibration Due">{tanggal(jatuhTempoKalibrasi(item))}</Baris>
      <Baris label="Status">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-bold',
            item.Keterangan === 'LAIK PAKAI'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          )}
        >
          {item.Keterangan}
        </span>
      </Baris>
      <Baris label="NIK Petugas">{item.PetugasNik}</Baris>
    </dl>
  );
}

function PanelKalibrasi({ rows }) {
  return (
    <div role="tabpanel" id="panel-kalibrasi" aria-labelledby="tab-kalibrasi">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada riwayat kalibrasi.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.date} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#13263D]">{tanggal(r.date)}</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {r.result}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{r.method}</p>
              <p className="mt-1 text-xs text-slate-500">
                Penyimpangan {r.deviation} · {r.by}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PanelPerawatan({ rows }) {
  return (
    <div role="tabpanel" id="panel-maintenance" aria-labelledby="tab-maintenance">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada riwayat pemeliharaan.</p>
      ) : (
        <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
          {rows.map((r) => (
            <li key={r.date} className="relative">
              <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-[#E2762B]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#13263D]">{tanggal(r.date)}</p>
              <p className="text-sm text-slate-600">{r.action}</p>
              <p className="text-xs text-slate-500">{r.by}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
