'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 500;

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

function Loader() {
  return (
    <Html center>
      <p className="rounded-md bg-[#0E2A47] px-4 py-2 text-sm font-medium text-white">Memuat panorama…</p>
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
 * Penampil panorama 360°. Seluruh keterangan area kini berada pada papan
 * informasi di lapisan antarmuka, sehingga kanvas ini hanya mengurus gambar
 * dan arah pandang — memutar panorama tidak lagi dapat menyembunyikan papan.
 */
export default function Viewer360({ scene, resetSignal }) {
  const camera = useMemo(() => ({ position: [0, 0, 0.1], fov: 72, near: 0.1, far: 1100 }), []);
  const controlsRef = useRef(null);

  // Perubahan resetSignal memulihkan arah pandang ke posisi awal.
  useEffect(() => {
    controlsRef.current?.reset?.();
  }, [resetSignal]);

  return (
    <Canvas camera={camera} dpr={[1, 2]} className="bg-[#0E2A47]">
      <Suspense fallback={<Loader />}>
        <Sphere src={scene.panorama} />
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
    </Canvas>
  );
}
