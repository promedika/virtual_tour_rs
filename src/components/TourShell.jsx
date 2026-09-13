'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBreadcrumb,
  getEquipmentIn,
  getFloorplanFor,
  getNavTree,
  getRumahSakit,
} from '@/src/data/hospitalData';
import { cn } from '@/src/lib/cn';
import ControlBar from './ControlBar';
import EquipmentModal from './EquipmentModal';
import Header from './Header';
import Minimap from './Minimap';
import NavDrawer from './NavDrawer';
import PanelGeser from './PanelGeser';
import SummaryPanel from './SummaryPanel';

// Penampil memuat WebGL, jadi hanya dirender di peramban.
const Viewer360 = dynamic(() => import('./Viewer360'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#0F1F33]">
      <p className="text-sm text-slate-300">Menyiapkan penampil 360°…</p>
    </div>
  ),
});

export default function TourShell({ rsId, sceneId }) {
  const router = useRouter();

  const [selected, setSelected] = useState(null); // nomor acuan alat yang dibuka
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  // Ringkasan selalu mulai tertutup; dibuka lewat tombol info pada bilah bawah.
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  // Denah terbuka sendiri hanya pada layar lebar; di ponsel ruang tidak cukup.
  // Lebar jendela baru diketahui setelah hidrasi, jadi diperiksa sekali di sini
  // agar keluaran server dan peramban tetap sama.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- pengukuran viewport sekali jalan
  useEffect(() => setMapOpen(window.innerWidth >= 1024), []);

  // Berpindah ruangan menutup kembali ringkasan agar pandangan tidak terhalang.
  // Rute /tur/[rs]/[scene] memakai komponen yang sama, jadi state tidak ikut hilang.
  const [sceneTerakhir, setSceneTerakhir] = useState(sceneId);
  if (sceneTerakhir !== sceneId) {
    setSceneTerakhir(sceneId);
    setSummaryOpen(false);
  }

  // Seluruh tampilan dibaca ulang dari data setiap rsId atau sceneId berubah,
  // sehingga perubahan data dari backend langsung tercermin tanpa rute khusus.
  const rs = getRumahSakit(rsId);
  const scene = rs.scenes[sceneId];

  const trail = useMemo(() => getBreadcrumb(rsId, sceneId), [rsId, sceneId]);
  const plan = useMemo(() => getFloorplanFor(rsId, sceneId), [rsId, sceneId]);
  const tree = useMemo(() => getNavTree(rsId), [rsId]);
  const alatDiRuangan = useMemo(() => getEquipmentIn(rsId, sceneId), [rsId, sceneId]);

  const navigate = useCallback(
    (id) => {
      setSelected(null);
      setDrawerOpen(false);
      router.push(`/tur/${rsId}/${id}`);
    },
    [router, rsId]
  );

  /** Berpindah rumah sakit selalu dimulai dari scene awal miliknya. */
  const gantiRumahSakit = useCallback(
    (id) => {
      setSelected(null);
      setDrawerOpen(false);
      router.push(`/tur/${id}/${getRumahSakit(id).profil.sceneAwal}`);
    },
    [router]
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0F1F33]">
      <Header
        rsAktif={rs.profil}
        trail={trail}
        onOpenDrawer={() => setDrawerOpen(true)}
        onGantiRumahSakit={gantiRumahSakit}
        onNavigate={navigate}
      />

      <div className="flex min-h-0 flex-1">
        <NavDrawer
          tree={tree}
          activeId={scene.id}
          activeTrail={trail.map((s) => s.id)}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onNavigate={navigate}
          onSelect={setSelected}
        />

        <main className="relative min-w-0 flex-1 bg-[#0F1F33]">
          <Viewer360
            key={`${rsId}-${scene.id}`} /* bangun ulang penampil saat pindah area */
            scene={scene}
            equipment={rs.equipment}
            onSelect={setSelected}
            onNavigate={navigate}
            resetSignal={resetSignal}
          />

          {/* Nama ruangan; tidak menghalangi interaksi penampil. */}
          <div className="pointer-events-none absolute left-3 top-3 max-w-[55%] rounded-lg bg-[#13263D]/85 px-3 py-2 ring-1 ring-white/10">
            <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#E2762B]">
              {scene.building ?? 'Area'}
            </p>
            <h1 className="truncate text-sm font-bold text-white sm:text-base">{scene.name}</h1>
          </div>

          {/* Ringkasan: lembar atas di ponsel dan tablet — di bawah papan nama
              ruangan, jauh dari bilah kendali — dan kartu kanan atas mulai
              layar lebar. Dapat digeser bila menutupi pandangan. */}
          {summaryOpen && (
            <PanelGeser
              className="absolute inset-x-3 top-[4.75rem] flex justify-end lg:inset-x-auto lg:right-3 lg:top-3 lg:w-[19rem]"
              label="Geser panel ringkasan"
            >
              <SummaryPanel
                scene={scene}
                equipment={alatDiRuangan}
                open={summaryOpen}
                onToggle={() => setSummaryOpen((v) => !v)}
                onSelect={setSelected}
              />
            </PanelGeser>
          )}

          {/* Denah di kanan bawah, dengan jarak tetap dari bilah kendali;
              juga dapat digeser pengguna. */}
          {plan && (
            <PanelGeser
              className={cn(
                'absolute bottom-20 right-3 transition-opacity duration-300 lg:bottom-3',
                /* Di bawah 1024px ringkasan memakai hampir seluruh tinggi layar,
                   jadi denah disembunyikan agar keduanya tidak pernah bertindih. */
                summaryOpen && 'invisible opacity-0 lg:visible lg:opacity-100'
              )}
              label="Geser denah"
              gagang={mapOpen}
            >
              <Minimap plan={plan} activeId={scene.id} open={mapOpen} onToggle={() => setMapOpen((v) => !v)} onNavigate={navigate} />
            </PanelGeser>
          )}

          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 sm:left-3 sm:translate-x-0">
            <ControlBar
              mapOpen={mapOpen}
              summaryOpen={summaryOpen}
              onToggleMap={() => setMapOpen((v) => !v)}
              onToggleSummary={() => setSummaryOpen((v) => !v)}
              onReset={() => setResetSignal((n) => n + 1)}
            />
          </div>
        </main>
      </div>

      <EquipmentModal item={rs.equipment[selected] ?? null} onClose={() => setSelected(null)} />
    </div>
  );
}
