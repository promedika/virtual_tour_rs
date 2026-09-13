import { notFound } from 'next/navigation';
import TourShell from '@/src/components/TourShell';
import { getRumahSakit, semuaScene } from '@/src/data/hospitalData';

type Params = Promise<{ rs: string; scene: string }>;

/** Seluruh pasangan rumah sakit dan scene dihasilkan sebagai halaman statis. */
export function generateStaticParams() {
  return semuaScene();
}

export async function generateMetadata({ params }: { params: Params }) {
  const { rs, scene } = await params;
  const data = getRumahSakit(rs);
  const s = data.scenes[scene];
  return {
    title: s ? `${s.name} · ${data.profil.nama} · Tur Virtual 360°` : 'Area tidak ditemukan',
  };
}

export default async function TurPage({ params }: { params: Params }) {
  const { rs, scene } = await params;
  const data = getRumahSakit(rs);

  // getRumahSakit mengembalikan data pertama bila id tidak dikenal,
  // jadi id diperiksa agar alamat yang salah tetap menghasilkan 404.
  if (data.profil.id !== rs || !data.scenes[scene]) notFound();

  return <TourShell rsId={rs} sceneId={scene} />;
}
