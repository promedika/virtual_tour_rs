'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, ChevronUp, Stethoscope } from 'lucide-react';
import { PLAT, RASIO_MIN, tataKeping } from '@/src/data/geometri';
import { cn } from '@/src/lib/cn';

const RADIUS = 500;

/**
 * Ukuran huruf penanda: satu rumus untuk semua peranti. Batas bawah menjaga
 * keterbacaan di ponsel, cabang tengah mengikuti tinggi layar, batas atas
 * mencegah penanda menjadi raksasa di monitor lebar. Seluruh ukuran lain
 * (bantalan, tinggi, lebar maksimum) diturunkan dalam em dari angka ini,
 * sehingga keping selalu sebanding dan label tidak pernah meluber.
 */
const FONT = `clamp(0.625rem, ${PLAT.fontVh}vh, 1rem)`;

/** Bola panorama. scale [-1,1,1] membalik normal agar tekstur terlihat dari dalam. */
function Sphere({ src }) {
  // colorSpace diatur lewat callback agar nilai dari hook tidak dimutasi saat render.
  const texture = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[RADIUS, 64, 44]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

/**
 * Kerangka penanda 3D. Satu bentuk untuk navigasi maupun alat, pada semua
 * ukuran layar: keping bersudut bulat dengan ikon di kiri dan label yang selalu
 * tampak. Ukurannya mengikuti FONT (clamp) dan seluruh jarak dalam memakai em,
 * sehingga tidak ada label yang meluber atau terpotong di peranti mana pun.
 */
function Keping({ ikon: Ikon, label, warna, cincin, onClick, judul }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={judul}
      className={cn(
        'pointer-events-auto flex items-center rounded-full font-bold uppercase tracking-wide text-white',
        'shadow-[0_2px_12px_rgba(0,0,0,0.55)] backdrop-blur-[1px] transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
        warna,
        cincin
      )}
      style={{
        fontSize: FONT,
        gap: '0.4em',
        padding: `${PLAT.bantalanVh / PLAT.fontVh / 2}em ${PLAT.bantalanVh / PLAT.fontVh}em`,
        lineHeight: 1.15,
      }}
    >
      <Ikon
        className="shrink-0"
        style={{ width: `${PLAT.ikonVh / PLAT.fontVh}em`, height: `${PLAT.ikonVh / PLAT.fontVh}em` }}
        aria-hidden="true"
      />
      {/* whitespace-nowrap tanpa truncate: label selalu tampil utuh; penataan
          letak di tataKeping() yang menjamin keping tidak saling bertindih. */}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

/**
 * Penanda alat: keping oranye ber-ikon alat medis dengan nama yang selalu
 * tampak, sehingga jelas dapat disentuh tanpa perlu diarahkan kursor.
 */
function EquipmentPin({ position, item, onSelect }) {
  const laik = item.Keterangan === 'LAIK PAKAI';
  return (
    <Html position={position} center zIndexRange={[18, 0]}>
      <div className="relative flex flex-col items-center">
        <Keping
          ikon={Stethoscope}
          label={item.AlatNama}
          judul={`Lihat detail ${item.AlatNama}`}
          onClick={() => onSelect(item.ref)}
          warna="bg-[#13263D]/95 hover:bg-[#E2762B]"
          // Warna cincin menandakan status: hijau laik pakai, kuning perlu diperiksa.
          cincin={laik ? 'ring-2 ring-emerald-400' : 'ring-2 ring-amber-400'}
        />
        {/* Titik jangkar menunjuk letak alat yang sebenarnya. */}
        <span
          className={cn('mt-[0.25em] size-[0.5em] rounded-full ring-1 ring-white/70', laik ? 'bg-emerald-400' : 'bg-amber-400')}
          style={{ fontSize: FONT }}
          aria-hidden="true"
        />
      </div>
    </Html>
  );
}

/**
 * Penanda navigasi. Bentuknya sama persis dengan penanda alat — hanya warna dan
 * ikonnya yang berbeda — sehingga tidak ada lagi dua perlakuan terpisah antara
 * layar lebar dan ponsel. Ikon mengikuti letak tujuan: kiri, kanan, atau lurus.
 */
function NavBadge({ position, arahX = position[0], label, to, onNavigate }) {
  // Arah ikon mengikuti letak rancangan, bukan letak setelah penataan, agar
  // panah tetap menunjuk sisi tujuan walau kepingnya digeser sedikit.
  const ikon = arahX < 0 ? ChevronLeft : arahX > 0 ? ChevronRight : ChevronUp;
  return (
    <Html position={position} center zIndexRange={[16, 0]}>
      <Keping
        ikon={ikon}
        label={label}
        judul={`Menuju ${label}`}
        onClick={() => onNavigate(to)}
        warna="bg-[#1E3A5F]/95 hover:bg-[#E2762B]"
        cincin="ring-2 ring-white/80"
      />
    </Html>
  );
}


/**
 * Menata seluruh keping menurut ukuran kanvas yang sedang berlaku, lalu
 * merendernya. Penataan diulang hanya saat ukuran kanvas berubah, sehingga
 * memutar peranti atau membuka panel samping langsung merapikan penanda.
 */
function Penanda({ hotspots, equipment, onSelect, onNavigate }) {
  const lebar = useThree((s) => s.size.width);
  const tinggi = useThree((s) => s.size.height);

  const tampil = useMemo(
    () =>
      hotspots
        .map((h) => (h.type === 'nav' ? h : equipment[h.ref] && { ...h, label: equipment[h.ref].AlatNama }))
        .filter(Boolean),
    [hotspots, equipment]
  );

  const letak = useMemo(() => tataKeping(tampil, lebar, tinggi), [tampil, lebar, tinggi]);

  return tampil.map((h, i) =>
    h.type === 'nav' ? (
      <NavBadge
        key={`nav-${h.to}-${i}`}
        position={letak[i]}
        arahX={h.position[0]}
        label={h.label}
        to={h.to}
        onNavigate={onNavigate}
      />
    ) : (
      <EquipmentPin key={`eq-${h.ref}-${i}`} position={letak[i]} item={equipment[h.ref]} onSelect={onSelect} />
    )
  );
}

function Loader() {
  return (
    <Html center>
      <p className="rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-medium text-white">Memuat panorama…</p>
    </Html>
  );
}

/** Menyimpan rujukan kendali orbit agar bilah bawah dapat mengatur ulang pandangan. */
function ControlsBridge({ controlsRef }) {
  const { controls } = useThree();
  useEffect(() => {
    controlsRef.current = controls ?? null;
  }, [controls, controlsRef]);
  return null;
}

/**
 * Menjamin sudut pandang mendatar tidak pernah lebih sempit dari RASIO_MIN:
 * pada jendela yang kurang lebar, fov menegak diperbesar. Tanpa ini panah sisi
 * kiri/kanan akan keluar layar saat panel samping mempersempit penampil.
 */
function LebarPandangMinimum() {
  // useFrame dipakai, bukan useEffect, karena kamera adalah objek milik three.js
  // yang memang diubah di dalam gelung render — bukan state React.
  useFrame(({ camera, size }) => {
    const rasio = size.width / size.height;
    const fov = rasio >= RASIO_MIN ? 72 : (Math.atan(Math.tan((36 * Math.PI) / 180) * (RASIO_MIN / rasio)) * 360) / Math.PI;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

export default function Viewer360({ scene, equipment, onSelect, onNavigate, resetSignal }) {
  const camera = useMemo(() => ({ position: [0, 0, 0.1], fov: 72, near: 0.1, far: 1100 }), []);
  const controlsRef = useRef(null);

  // Perubahan resetSignal memulihkan arah pandang ke posisi awal.
  useEffect(() => {
    controlsRef.current?.reset?.();
  }, [resetSignal]);

  return (
    <Canvas camera={camera} dpr={[1, 2]} className="bg-[#0F1F33]">
      <Suspense fallback={<Loader />}>
        <Sphere src={scene.panorama} />
        <Penanda hotspots={scene.hotspots} equipment={equipment} onSelect={onSelect} onNavigate={onNavigate} />
      </Suspense>

      {/* Panning dimatikan: kamera tetap di pusat bola, hanya berputar.
          Zoom dimatikan karena menggeser kamera dari pusat merusak proyeksi panorama. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={-0.35}
        target={[0, 0, 0]}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI - 0.2}
      />
      <ControlsBridge controlsRef={controlsRef} />
      <LebarPandangMinimum />
    </Canvas>
  );
}
