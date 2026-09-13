// Unduh foto alat medis dari Wikimedia Commons, perkecil ke 800x600.
// Jalankan sekali: node scripts/fetch-alat.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = { 'User-Agent': 'TurVirtualRS/1.0 (kontak: dev@gps.local)' };

// ref alat -> judul berkas Commons yang sudah diperiksa lisensinya.
const MAP = {
  'GPS-TND-001': 'File:Sphygmomanometer.jpg',
  'GPS-KRS-002': 'File:Wheelchair transfer.jpg',
  'GPS-RFG-003': 'File:Revco -80 freezer pl.jpg',
  'GPS-TMB-004': 'File:Analytical balance mettler ae-260.jpg',
  'GPS-MRI-005': 'File:MRI-Philips.JPG',
  'GPS-CTS-006': 'File:UPMC Computed Tomography.jpg',
  'GPS-XRM-007': 'File:Mobile X-ray machine.jpg',
  'GPS-CFG-008': 'File:Laboratory centrifuge.jpg',
  'GPS-MKR-009': 'File:Optical microscope nikon alphaphot.jpg',
  'GPS-MJO-010': 'File:Operating table 01.JPG',
  'GPS-ANS-011': 'File:Anesthesia machine.jpg',
  'GPS-LMP-012': 'File:Surgical light.jpg',
  'GPS-PMN-013': 'File:Vital signs monitor display.jpg',
  'GPS-VNT-014': 'File:Mechanical ventilator.jpg',
  'GPS-SYP-015': 'File:Syringe pump.jpg',

  // RSUD Sanjiwani Gianyar — mengikuti lembar kalibrasi.
  'SJW-BSM-001': 'File:Patient monitor.jpg',
  'SJW-NEB-002': 'File:Nebulizer.jpg',
  'SJW-ECG-003': 'File:ECG machine.jpg',
  'SJW-SCT-004': 'File:Suction pump.jpg',
  'SJW-INF-005': 'File:Infusion pump.jpg',
  'SJW-DEF-006': 'File:Defibrillator.jpg',
  'SJW-USG-007': 'File:Ultrasound machine.jpg',
  'SJW-XRY-008': 'File:X-ray machine.jpg',
  'SJW-DTL-009': 'File:Dental chair.jpg',
  'SJW-THR-010': 'File:Infrared thermometer.jpg',
};

const OUT = path.join(process.cwd(), 'public', 'alat');

/** Ambil URL berkas asli + info lisensi. */
async function info(title) {
  const u = `${API}?action=query&titles=${encodeURIComponent(
    title
  )}&prop=imageinfo&iiprop=url|extmetadata|size&format=json`;
  const r = await fetch(u, { headers: UA });
  const j = await r.json();
  const page = Object.values(j?.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  return {
    url: ii.url,
    lisensi: ii.extmetadata?.LicenseShortName?.value ?? '?',
    pembuat: (ii.extmetadata?.Artist?.value ?? '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 70),
  };
}

/** Cadangan: telusuri beberapa kata kunci, ambil foto raster berlisensi terbuka pertama. */
async function cariCadangan(kunci) {
  for (const q of kunci) {
    const u = `${API}?action=query&generator=search&gsrsearch=${encodeURIComponent(
      q
    )}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata|size&format=json`;
    const r = await fetch(u, { headers: UA });
    const j = await r.json();
    const pages = Object.values(j?.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii || (ii.width ?? 0) < 700) continue;
      if (!/\.(jpg|jpeg|png)$/i.test(ii.url.split('?')[0])) continue;
      const lic = ii.extmetadata?.LicenseShortName?.value ?? '';
      if (!/^(CC0|Public domain|CC BY)/i.test(lic)) continue;
      return {
        url: ii.url,
        lisensi: lic,
        pembuat: (ii.extmetadata?.Artist?.value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 70),
        judul: p.title,
      };
    }
  }
  return null;
}

/** Kata kunci cadangan per alat bila judul berkas utama tidak tersedia. */
const CADANGAN = {
  'GPS-KRS-002': ['Self-service wheelchairs in hospital', 'Wheelchairs in hospital corridor', 'wheelchair hospital'],
  'GPS-RFG-003': ['laboratory refrigerator', 'pharmacy refrigerator', 'vaccine cold chain refrigerator'],
  'GPS-CTS-006': ['CT scan machine hospital', 'computed tomography room', 'Siemens CT scanner'],
  'GPS-MJO-010': ['operating theatre table', 'surgical table operating room', 'operating theatre equipment'],
  'GPS-ANS-011': ['anesthesia workstation', 'anaesthesia machine hospital', 'anesthesia equipment operating room'],
  'GPS-LMP-012': ['operating theatre light', 'surgical lighting operating room', 'operating lamp hospital'],
  'GPS-PMN-013': ['bedside patient monitor', 'patient monitoring intensive care', 'vital sign monitor hospital'],
  'SJW-BSM-001': ['bedside patient monitor', 'vital signs monitor hospital', 'patient monitoring intensive care'],
  'SJW-NEB-002': ['nebulizer compressor', 'nebuliser medical device', 'asthma nebulizer'],
  'SJW-ECG-003': ['electrocardiograph machine', 'ECG recorder hospital', 'electrocardiogram device'],
  'SJW-SCT-004': ['medical suction device', 'aspirator medical equipment', 'suction machine hospital'],
  'SJW-INF-005': ['infusion pump hospital', 'volumetric infusion pump', 'IV pump medical'],
  'SJW-DEF-006': ['defibrillator hospital', 'automated external defibrillator', 'cardiac defibrillator device'],
  'SJW-USG-007': ['ultrasound machine hospital', 'sonography equipment', 'ultrasonography device'],
  'SJW-XRY-008': ['radiography x-ray room', 'x-ray equipment hospital', 'radiographic unit'],
  'SJW-DTL-009': ['dental chair clinic', 'dental unit equipment', 'dentist chair'],
  'SJW-THR-010': ['infrared thermometer medical', 'clinical thermometer device', 'non contact thermometer'],
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const kredit = {};

  for (const [ref, title] of Object.entries(MAP)) {
    const dest = path.join(OUT, `${ref}.jpg`);
    let meta = await info(title);
    if (!meta && CADANGAN[ref]) meta = await cariCadangan(CADANGAN[ref]);
    if (!meta) {
      console.log(`${ref}: TIDAK DITEMUKAN (${title})`);
      continue;
    }
    if (meta.judul) console.log(`${ref}: pakai cadangan ${meta.judul}`);

    kredit[ref] = { lisensi: meta.lisensi, pembuat: meta.pembuat };

    if (existsSync(dest)) {
      console.log(`${ref}: sudah ada`);
      continue;
    }

    const res = await fetch(meta.url, { headers: UA });
    if (!res.ok) {
      console.log(`${ref}: unduh gagal ${res.status}`);
      continue;
    }
    const raw = Buffer.from(await res.arrayBuffer());
    const out = await sharp(raw)
      .resize(800, 600, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    await writeFile(dest, out);
    console.log(`${ref}: ${(out.length / 1024).toFixed(0)} KB | ${meta.lisensi}`);
  }

  console.log('\n--- kredit ---');
  console.log(JSON.stringify(kredit, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
