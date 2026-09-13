// Uji tata letak penanda: memastikan setiap panah dan titik alat benar-benar
// terlihat dalam satu layar tanpa memutar kamera, tidak saling bertindihan,
// dan arah panah sesuai letak tujuannya.
// Jalankan: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { daftarRumahSakit, getRumahSakit } from './hospitalData.js';
import { PANDANGAN, PLAT, SLOT, fontVhEfektif, lebarPlatVh, setengahTinggiEfektif, tataKeping } from './geometri.js';

const SEMUA = daftarRumahSakit.map((r) => getRumahSakit(r.id));

// Peranti uji: tiga lebar ponsel yang diminta, tablet, dan desktop.
const PERANTI = [
  { nama: 'ponsel kecil', lebar: 360, tinggi: 640 },
  { nama: 'ponsel', lebar: 390, tinggi: 844 },
  { nama: 'ponsel lebar', lebar: 414, tinggi: 896 },
  { nama: 'tablet', lebar: 820, tinggi: 1180 },
  { nama: 'desktop', lebar: 1920, tinggi: 1080 },
];

// Satu vh dalam satuan layar ternormalkan (-1..1). Tinggi layar = 100vh = 2 satuan,
// lebar layar = 100 x rasio vh = 2 satuan.
const VH_Y = 2 / 100;
const VH_X = 2 / (100 * (PANDANGAN.setengahLebar / PANDANGAN.setengahTinggi));

/** Memproyeksikan titik dunia ke layar ternormalkan; x,y dalam rentang -1..1. */
function keLayar([x, y, z]) {
  const depan = -z; // kamera menghadap sumbu -Z
  assert.ok(depan > 0, `titik berada di belakang kamera: ${[x, y, z]}`);
  return { x: x / depan / PANDANGAN.setengahLebar, y: y / depan / PANDANGAN.setengahTinggi };
}

/**
 * Kotak pembatas keping penanda, dalam satuan layar. Keping menghadap kamera
 * tanpa kemiringan, jadi kotaknya langsung selebar pelat dan setinggi PLAT.tinggiVh.
 */
function kotakPanah({ position, label }) {
  const { x, y } = keLayar(position);
  return { x, y, w: (lebarPlatVh(label) / 2) * VH_X, h: (PLAT.tinggiVh / 2) * VH_Y, label };
}

/** Seluruh keping sebuah ruangan — navigasi maupun alat — beserta labelnya. */
function kepingRuangan(rs, scene) {
  return scene.hotspots
    .map((h) => (h.type === 'nav' ? h : rs.equipment[h.ref] && { ...h, label: rs.equipment[h.ref].AlatNama }))
    .filter(Boolean);
}

/** Kotak pembatas hasil penataan pada satu ukuran layar tertentu. */
function kotakTertata(kepings, peranti) {
  const rasio = peranti.lebar / peranti.tinggi;
  const setengahTinggi = setengahTinggiEfektif(rasio);
  const setengahLebar = setengahTinggi * rasio;
  const fontVh = fontVhEfektif(peranti.tinggi);
  const skala = fontVh / PLAT.fontVh;
  const vhX = 2 / (100 * rasio);

  return tataKeping(kepings, peranti.lebar, peranti.tinggi).map(([x, y, z], i) => ({
    x: x / -z / setengahLebar,
    y: y / -z / setengahTinggi,
    w: (lebarPlatVh(kepings[i].label, fontVh) / 2) * vhX,
    h: ((PLAT.tinggiVh * skala) / 2) * VH_Y,
    label: kepings[i].label,
  }));
}

const bertindih = (a, b) => Math.abs(a.x - b.x) < a.w + b.w && Math.abs(a.y - b.y) < a.h + b.h;

test('setiap panah navigasi memakai salah satu slot baku', () => {
  const baku = Object.values(SLOT).map((p) => p.join(','));
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      for (const h of s.hotspots.filter((x) => x.type === 'nav')) {
        assert.ok(baku.includes(h.position.join(',')), `${rs.id}/${s.id}: panah "${h.label}" di luar slot baku`);
      }
    }
  }
});

test('seluruh panah muat dalam satu layar tanpa memutar kamera', () => {
  // Diperiksa pada rancangan awal, sebelum penataan otomatis ikut membantu.
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      for (const h of s.hotspots.filter((x) => x.type === 'nav')) {
        const k = kotakPanah(h);
        assert.ok(Math.abs(k.y) + k.h <= 1, `${rs.id}/${s.id}: panah "${h.label}" melebihi tepi atas/bawah`);
      }
    }
  }
});

test('tidak ada keping yang bertindih atau keluar layar di tiap ukuran peranti', () => {
  // Inilah jaminan utama: setelah tataKeping(), seluruh penanda — navigasi
  // maupun alat — berada di dalam layar dan tidak ada yang dempet, pada lebar
  // 360, 390, 414 px sampai desktop.
  for (const p of PERANTI) {
    for (const rs of SEMUA) {
      for (const s of Object.values(rs.scenes)) {
        const kotak = kotakTertata(kepingRuangan(rs, s), p);

        for (const k of kotak) {
          assert.ok(
            Math.abs(k.x) + k.w <= 1 + 1e-9,
            `${p.nama} ${rs.id}/${s.id}: "${k.label}" keluar layar mendatar`
          );
          assert.ok(
            Math.abs(k.y) + k.h <= 1 + 1e-9,
            `${p.nama} ${rs.id}/${s.id}: "${k.label}" keluar layar menegak`
          );
        }
        for (let i = 0; i < kotak.length; i += 1) {
          for (let j = i + 1; j < kotak.length; j += 1) {
            assert.ok(
              !bertindih(kotak[i], kotak[j]),
              `${p.nama} ${rs.id}/${s.id}: "${kotak[i].label}" menimpa "${kotak[j].label}"`
            );
          }
        }
      }
    }
  }
});

test('penataan tidak memindahkan keping ke sisi layar yang berlawanan', () => {
  // Panah kiri harus tetap di kiri layar agar ikon dan letaknya sejalan.
  for (const p of PERANTI) {
    for (const rs of SEMUA) {
      for (const s of Object.values(rs.scenes)) {
        const kepings = kepingRuangan(rs, s);
        const kotak = kotakTertata(kepings, p);
        kepings.forEach((h, i) => {
          if (h.type !== 'nav' || h.position[0] === 0) return;
          assert.equal(
            h.position[0] < 0,
            kotak[i].x < 0,
            `${p.nama} ${rs.id}/${s.id}: "${h.label}" berpindah sisi setelah ditata`
          );
        });
      }
    }
  }
});

test('arah panah searah dengan letak tujuannya', () => {
  // Viewer360 menentukan arah dari tanda position[0]: negatif menunjuk kiri.
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      for (const h of s.hotspots.filter((x) => x.type === 'nav')) {
        const keKiri = h.position[0] < 0;
        const layar = keLayar(h.position);
        assert.equal(keKiri, layar.x < 0, `${rs.id}/${s.id}: arah panah "${h.label}" berlawanan dengan letaknya`);
      }
    }
  }
});

test('keping penanda tetap terbaca dan label terpanjang muat utuh di layar', () => {
  // clamp(0,625rem, PLAT.fontVh vh, 1rem): batas bawah menjaga keterbacaan,
  // batas atas menjaga keping tetap ringkas. Label tidak pernah dipotong, jadi
  // keping terpanjang wajib benar-benar muat dalam lebar layar.
  const MIN_PX = 10; // 0,625rem
  const MAKS_PX = 16; // 1rem

  const labelTerpanjang = SEMUA.flatMap((rs) =>
    Object.values(rs.scenes).flatMap((s) => kepingRuangan(rs, s).map((h) => h.label))
  ).sort((a, b) => b.length - a.length)[0];

  for (const p of PERANTI) {
    const px = (fontVhEfektif(p.tinggi) / 100) * p.tinggi;
    assert.ok(px >= MIN_PX - 1e-9, `${p.nama}: huruf penanda terlalu kecil (${px}px)`);
    assert.ok(px <= MAKS_PX + 1e-9, `${p.nama}: huruf penanda terlalu besar (${px}px)`);

    const lebarPx = (lebarPlatVh(labelTerpanjang, fontVhEfektif(p.tinggi)) / 100) * p.tinggi;
    assert.ok(
      lebarPx <= p.lebar,
      `${p.nama}: keping "${labelTerpanjang}" (${Math.round(lebarPx)}px) melebihi lebar layar ${p.lebar}px`
    );
  }
});
