import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, CircleCheck, MapPin, Stethoscope } from 'lucide-react';
import { daftarRumahSakit, getRumahSakit } from '@/src/data/hospitalData';

export const metadata = {
  title: 'Dasbor Tur Virtual 360° · PT. Global Promedika Services',
  description:
    'Pilih rumah sakit untuk menelusuri gedung, lantai, ruangan, dan data kalibrasi alat medis dalam tampilan 360°.',
};

// Berkas data berupa JavaScript biasa, jadi bentuk yang dipakai di sini
// dijelaskan agar pemeriksaan tipe tetap berjalan.
type Scene = { level: string };
type Alat = { Keterangan: string };

/** Ringkasan angka per rumah sakit, dihitung dari data agar selalu sinkron. */
function ringkasan(id: string) {
  const rs = getRumahSakit(id);
  const scenes = Object.values(rs.scenes) as Scene[];
  const alat = Object.values(rs.equipment) as Alat[];
  return {
    profil: rs.profil,
    jumlahRuangan: scenes.filter((s) => s.level === 'room').length,
    jumlahLantai: scenes.filter((s) => s.level === 'floor').length,
    jumlahAlat: alat.length,
    laik: alat.filter((a) => a.Keterangan === 'LAIK PAKAI').length,
  };
}

export default function DasborPage() {
  const daftar = daftarRumahSakit.map((rs) => ringkasan(rs.id));

  return (
    <main className="min-h-dvh bg-[#0F1F33] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Alas putih menjaga logo tetap tajam di atas latar gelap. */}
          <span className="flex shrink-0 items-center rounded-md bg-white px-2 py-1 shadow-sm">
            <Image
              src="/logo-gps.png"
              alt="PT. Global Promedika Services"
              width={578}
              height={400}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />
          </span>
          <p className="hidden text-xs text-slate-400 sm:block">Tur Virtual 360° &amp; Data Kalibrasi</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E2762B]/15 px-3 py-1 text-xs font-semibold text-[#E2762B]">
          <Building2 className="size-3.5" aria-hidden="true" />
          {daftar.length} rumah sakit terdaftar
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Dasbor Tur Virtual Rumah Sakit</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Pilih rumah sakit untuk menelusuri gedung, lantai, dan ruangan dalam tampilan 360°. Setiap alat medis
          dilengkapi riwayat kalibrasi dan pemeliharaan sesuai lembar kerja teknisi.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {daftar.map((rs) => (
            <li key={rs.profil.id}>
              <Link
                href={`/tur/${rs.profil.id}/${rs.profil.sceneAwal}`}
                className="group flex h-full flex-col rounded-xl bg-[#13263D] p-5 ring-1 ring-white/10 transition hover:ring-[#E2762B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2762B]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-white">{rs.profil.nama}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="size-3.5 shrink-0 text-[#E2762B]" aria-hidden="true" />
                      {rs.profil.wilayah}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#E2762B]/15 text-[#E2762B] transition group-hover:bg-[#E2762B] group-hover:text-white">
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-400">{rs.profil.kelas}</p>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-wide text-slate-500">Lantai</dt>
                    <dd className="text-lg font-bold text-white">{rs.jumlahLantai}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-wide text-slate-500">Ruangan</dt>
                    <dd className="text-lg font-bold text-white">{rs.jumlahRuangan}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-wide text-slate-500">Alat</dt>
                    <dd className="text-lg font-bold text-white">{rs.jumlahAlat}</dd>
                  </div>
                </dl>

                <p className="mt-4 inline-flex items-center gap-1.5 self-start rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                  {rs.laik} dari {rs.jumlahAlat} alat laik pakai
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 flex items-start gap-2 rounded-lg bg-white/5 p-4 text-xs leading-relaxed text-slate-400">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-[#E2762B]" aria-hidden="true" />
          <span>
            Panorama bersumber dari Poly Haven (CC0) dan foto alat dari Wikimedia Commons, dipakai sebagai contoh
            tampilan. Ganti dengan foto lokasi dan alat yang sebenarnya sebelum dipakai di lingkungan produksi.
          </span>
        </p>
      </div>
    </main>
  );
}
