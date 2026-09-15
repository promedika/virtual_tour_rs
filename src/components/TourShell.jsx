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
import InfoBoard from './InfoBoard';
import Minimap from './Minimap';
import NavDrawer from './NavDrawer';
import PanelGeser from './PanelGeser';

// Penampil memuat WebGL, jadi hanya dirender di peramban.
const Viewer360 = dynamic(() => import('./Viewer360'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#0E2A47]">
      <p className="text-sm text-slate-300">Menyiapkan penampil 360°…</p>
    </div>
  ),
});

export default function TourShell({ rsId, sceneId }) {
  const router = useRouter();

  const [selected, setSelected] = useState(null); // nomor acuan alat yang dibuka
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  // Papan informasi adalah jalur utama menelusuri area, jadi tampil sejak awal.
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);

  // Denah terbuka sendiri hanya pada layar lebar; di ponsel ruang tidak cukup.
  // Lebar jendela baru diketahui setelah hidrasi, jadi diperiksa sekali di sini
  // agar keluaran server dan peramban tetap sama.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- pengukuran viewport sekali jalan
  useEffect(() => setMapOpen(window.innerWidth >= 1024), []);

  // Berpindah area selalu memunculkan kembali papan informasi, sehingga isi
  // ruangan baru langsung terbaca. Rute /tur/[rs]/[scene] memakai komponen yang
  // sama, jadi state tidak ikut hilang saat berpindah.
  const [sceneTerakhir, setSceneTerakhir] = useState(sceneId);
  if (sceneTerakhir !== sceneId) {
    setSceneTerakhir(sceneId);
    setSummaryOpen(true);
  }

  // Seluruh tampilan dibaca ulang dari data setiap rsId atau sceneId berubah,
  // sehingga perubahan data dari backend langsung tercermin tanpa rute khusus.
  const rs = getRumahSakit(rsId);
  const scene = rs.scenes[sceneId];

  const trail = useMemo(() => getBreadcrumb(rsId, sceneId), [rsId, sceneId]);
  const plan = useMemo(() => getFloorplanFor(rsId, sceneId), [rsId, sceneId]);
  const tree = useMemo(() => getNavTree(rsId), [rsId]);
  const alatDiRuangan = useMemo(() => getEquipmentIn(rsId, sceneId), [rsId, sceneId]);
  // Tujuan perpindahan diambil dari hotspot bertipe nav; papan informasi
  // menampilkannya sebagai daftar sehingga tidak ada penanda yang tersebar.
  const tujuan = useMemo(() => scene.hotspots.filter((h) => h.type === 'nav'), [scene]);

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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0E2A47]">
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

        <main className="relative min-w-0 flex-1 bg-[#0E2A47]">
          <Viewer360
            key={`${rsId}-${scene.id}`} /* bangun ulang penampil saat pindah area */
            scene={scene}
            resetSignal={resetSignal}
          />

          {/* Papan informasi berada di atas kanvas, bukan di dalamnya, sehingga
              memutar panorama tidak pernah menyembunyikannya. Letaknya dapat
              dipindahkan pengguna lewat gagang, sama seperti denah. */}
          {summaryOpen && (
            <PanelGeser className="absolute right-3 top-3 flex justify-end" label="Geser papan informasi">
              <InfoBoard
                scene={scene}
                equipment={alatDiRuangan}
                tujuan={tujuan}
                open={summaryOpen}
                onToggle={() => setSummaryOpen((v) => !v)}
                onSelect={setSelected}
                onNavigate={navigate}
              />
            </PanelGeser>
          )}

          {/* Denah di kanan bawah, dengan jarak tetap dari bilah kendali;
              juga dapat digeser pengguna. */}
          {plan && (
            <PanelGeser
              className={cn(
                'absolute bottom-20 right-3 transition-opacity duration-300 lg:bottom-3',
                /* Di layar sempit papan informasi memakai sebagian besar tinggi
                   layar, jadi denah disembunyikan agar keduanya tidak bertindih. */
                summaryOpen && mapOpen && 'invisible opacity-0 lg:visible lg:opacity-100'
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
