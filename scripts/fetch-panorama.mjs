// Unduh panorama equirectangular CC0 dari Poly Haven, lalu perkecil ke 4096x2048.
// Jalankan sekali: node scripts/fetch-panorama.mjs
// Tambahkan --force untuk mengunduh ulang saat pemetaan di bawah berubah.
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';


// berkas tujuan -> nama aset Poly Haven (semua CC0, foto 360 asli)
//
// Empat aset klinis sungguhan (surgery, hospital_room, hospital_room_2,
// childrens_hospital) dipakai untuk ruang perawatan. Sisanya memakai interior
// publik paling mendekati suasana rumah sakit: terang, berubin, ber-TL.
// Kedua rumah sakit berbagi berkas yang sama; jenis ruangan dipetakan oleh
// getPanoramaPath sehingga tidak ada salinan per rumah sakit.
const MAP = {
  'exterior.jpg': 'bethnal_green_entrance', // halaman/gerbang
  'lobby.jpg': 'rostock_laage_airport', // aula publik terang, meja pendaftaran
  'koridor-lantai-1.jpg': 'hospital_room_2', // koridor bangsal dengan ranjang
  'koridor-lantai-2.jpg': 'st_fagans_interior', // selasar modern lantai atas
  'ugd.jpg': 'hospital_room', // ruang tindakan: meja periksa + lampu bedah
  'radiologi.jpg': 'surgery', // suite peralatan berat, mendekati CT/X-ray
  'operasi.jpg': 'surgery', // kamar operasi sesungguhnya
  'icu.jpg': 'childrens_hospital', // ranjang rawat + monitor
  'laboratorium.jpg': 'vintage_measuring_lab', // laboratorium pengukuran
};


const OUT = path.join(process.cwd(), 'public', 'panorama');
const WIDTH = 4096;

async function resolveUrl(asset) {
  const res = await fetch(`https://api.polyhaven.com/files/${asset}`);
  if (!res.ok) throw new Error(`API gagal untuk ${asset}: ${res.status}`);
  const json = await res.json();
  const url = json?.tonemapped?.url;
  if (!url) throw new Error(`tonemapped tidak tersedia untuk ${asset}`);
  return url;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const paksa = process.argv.includes('--force');

  for (const [file, asset] of Object.entries(MAP)) {
    const dest = path.join(OUT, file);
    if (existsSync(dest) && !paksa) {
      console.log(`lewati (sudah ada): ${file}`);
      continue;
    }

    const url = await resolveUrl(asset);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`unduh gagal ${asset}: ${res.status}`);
    const raw = Buffer.from(await res.arrayBuffer());

    // Perkecil ke 2:1 agar pemetaan bola tepat dan berkas ringan untuk web.
    const out = await sharp(raw)
      .resize(WIDTH, WIDTH / 2, { fit: 'cover' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    await writeFile(dest, out);
    const meta = await sharp(out).metadata();
    console.log(`${file}: ${meta.width}x${meta.height} · ${(out.length / 1024 / 1024).toFixed(2)} MB · ${asset} (CC0)`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
