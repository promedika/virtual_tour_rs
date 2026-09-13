// Perhitungan letak penanda di dalam bola panorama.
// Dipakai bersama oleh seluruh berkas data rumah sakit.

/** Tinggi pandangan mata terhadap lantai, dalam satuan dunia 3D. */
export const TINGGI_MATA = 165;

/**
 * Titik di bidang lantai untuk panah navigasi.
 *
 * Penampil berada di titik asal dan lantai berjarak TINGGI_MATA di bawahnya.
 * Menghitung posisi dari arah mata angin membuat seluruh panah berada pada
 * satu bidang datar yang sama, sehingga tidak ada panah yang melayang
 * atau tenggelam seperti bila koordinat ditulis manual.
 *
 * @param {number} arah  derajat searah jarum jam; 0 = tepat di depan, 90 = kanan, 180 = belakang.
 * @param {number} jarak jarak mendatar dari penampil; makin kecil makin dekat ke kaki.
 */
export function lantai(arah, jarak = 300) {
  const rad = (arah * Math.PI) / 180;
  return [
    Math.round(Math.sin(rad) * jarak),
    -TINGGI_MATA,
    Math.round(-Math.cos(rad) * jarak),
  ];
}

/**
 * Titik setinggi pandangan mata untuk penanda alat.
 * @param {number} arah   derajat searah jarum jam dari arah pandang awal.
 * @param {number} jarak  jarak mendatar dari penampil.
 * @param {number} tinggi selisih tinggi terhadap mata; negatif berarti lebih rendah.
 */
export function benda(arah, jarak = 420, tinggi = -40) {
  const rad = (arah * Math.PI) / 180;
  return [
    Math.round(Math.sin(rad) * jarak),
    tinggi,
    Math.round(-Math.cos(rad) * jarak),
  ];
}

/**
 * Kamera penampil: fov menegak 72°. Viewer360 melebarkan fov pada jendela sempit
 * sehingga sudut pandang mendatar tidak pernah kurang dari rasio 1,6 — dengan
 * begitu batas di bawah berlaku untuk semua ukuran layar.
 * setengahTinggi = tan 36°; setengahLebar = setengahTinggi × 1,6.
 */
export const RASIO_MIN = 1.6;
export const PANDANGAN = {
  setengahTinggi: Math.tan((36 * Math.PI) / 180),
  setengahLebar: Math.tan((36 * Math.PI) / 180) * RASIO_MIN,
};

/**
 * Ukuran keping penanda navigasi dalam satuan vh. Satu bentuk dipakai untuk
 * semua ukuran layar; Viewer360 menurunkan seluruh ukuran dalam dari fontVh
 * memakai satuan em, lalu membatasinya dengan clamp() agar tidak pernah terlalu
 * kecil di layar mungil maupun terlalu besar di monitor lebar.
 *
 * Angka di bawah adalah batas terbesar (cabang vh dari clamp), sehingga uji tata
 * letak memakai keadaan terburuk: bila muat di sini, muat pula di layar sempit.
 */
export const PLAT = {
  fontVh: 1.9,
  hurufEm: 0.62,
  ikonVh: 2.2,
  bantalanVh: 1.6,
  tinggiVh: 4.2,
};

/** Batas ukuran huruf keping, sama persis dengan clamp() di Viewer360. */
const HURUF_MIN_PX = 10; // 0,625rem
const HURUF_MAKS_PX = 16; // 1rem

/** Jarak aman antar keping, dalam em terhadap huruf keping. */
const SELA_VH = 1.4;

/**
 * Perkiraan lebar keping penanda sebuah label, dalam vh.
 * Label tidak pernah dipotong, jadi lebarnya murni mengikuti panjang teks.
 */
export function lebarPlatVh(label, fontVh = PLAT.fontVh) {
  const isi = label.length * PLAT.hurufEm * PLAT.fontVh + PLAT.ikonVh + PLAT.bantalanVh * 2;
  return (isi * fontVh) / PLAT.fontVh;
}

/** Ukuran huruf keping yang benar-benar dipakai pada layar setinggi tinggiPx, dalam vh. */
export function fontVhEfektif(tinggiPx) {
  const px = Math.min(HURUF_MAKS_PX, Math.max(HURUF_MIN_PX, (PLAT.fontVh / 100) * tinggiPx));
  return (px / tinggiPx) * 100;
}

/** Setengah tinggi bidang pandang setelah Viewer360 melebarkan fov di layar sempit. */
export function setengahTinggiEfektif(rasio) {
  return rasio >= RASIO_MIN ? PANDANGAN.setengahTinggi : (PANDANGAN.setengahTinggi * RASIO_MIN) / rasio;
}

const jepit = (nilai, batas) => Math.max(-batas, Math.min(batas, nilai));

/**
 * Menata ulang keping penanda agar tidak pernah saling bertindih maupun keluar
 * layar, pada rasio layar apa pun — termasuk ponsel tegak, tempat keping
 * memakai porsi lebar jauh lebih besar daripada di monitor.
 *
 * Cara kerja: setiap keping diproyeksikan ke layar, digeser masuk bila
 * melewati tepi, lalu — hanya bila benar-benar bertabrakan dengan keping yang
 * sudah ditempatkan — dinaikkan selangkah demi selangkah. Keping yang tidak
 * berbenturan tetap di tempat rancangannya, sehingga penanda alat tetap
 * menunjuk benda yang benar. Hasilnya posisi dunia 3D baru.
 *
 * @param {{label: string, position: number[]}[]} kepings
 * @param {number} lebarPx lebar kanvas penampil
 * @param {number} tinggiPx tinggi kanvas penampil
 * @returns {number[][]} posisi dunia hasil penataan, berurutan sama dengan masukan
 */
export function tataKeping(kepings, lebarPx, tinggiPx) {
  if (kepings.length === 0) return [];

  const rasio = lebarPx / tinggiPx;
  const setengahTinggi = setengahTinggiEfektif(rasio);
  const setengahLebar = setengahTinggi * rasio;
  const fontVh = fontVhEfektif(tinggiPx);
  const skala = fontVh / PLAT.fontVh;

  const vhY = 2 / 100; // satu vh dalam satuan layar menegak (-1..1)
  const vhX = 2 / (100 * rasio); // satu vh dalam satuan layar mendatar
  const setengahT = ((PLAT.tinggiVh * skala) / 2) * vhY;
  const selaX = SELA_VH * skala * vhX;
  const langkah = 2 * setengahT + SELA_VH * skala * vhY;

  const kotak = kepings.map((k, i) => {
    const depan = -k.position[2];
    const w = (lebarPlatVh(k.label, fontVh) / 2) * vhX;
    return {
      i,
      z: k.position[2],
      depan,
      w,
      x: jepit(k.position[0] / depan / setengahLebar, Math.max(0, 1 - w)),
      y: k.position[1] / depan / setengahTinggi,
    };
  });

  // Keping terbawah ditempatkan lebih dulu; yang bertabrakan didorong ke atas
  // sampai bebas. Urutan dari bawah membuat tumpukan tumbuh ke ruang kosong.
  const batasY = Math.max(0, 1 - setengahT);
  const langkahMaks = Math.ceil((2 * batasY) / langkah);
  const ditempatkan = [];
  for (const k of [...kotak].sort((a, b) => a.y - b.y)) {
    const asal = jepit(k.y, batasY);
    const bebas = (y) =>
      !ditempatkan.some((l) => Math.abs(k.x - l.x) < k.w + l.w + selaX && Math.abs(y - l.y) < langkah);

    k.y = asal;
    for (let n = 0; n <= langkahMaks; n += 1) {
      const atas = asal + n * langkah;
      const bawah = asal - n * langkah;
      if (atas <= batasY && bebas(atas)) {
        k.y = atas;
        break;
      }
      if (bawah >= -batasY && bebas(bawah)) {
        k.y = bawah;
        break;
      }
    }
    ditempatkan.push(k);
  }

  return kepings.map((_, i) => {
    const k = kotak[i];
    return [k.x * setengahLebar * k.depan, k.y * setengahTinggi * k.depan, k.z];
  });
}

/**
 * Letak baku panah navigasi — dipakai semua scene agar tata letaknya seragam.
 *
 * Dua baris: baris atas (slot "jauh" dan "depan") untuk tujuan di hadapan
 * penampil, baris bawah (slot "dekat") untuk pindah lantai atau kembali.
 * Seluruh slot sudah dihitung agar muat dalam satu layar tanpa memutar kamera
 * dan tidak saling bertindihan; uji di hospitalData.test.mjs menjaganya.
 */
export const SLOT = {
  // Baris atas: y layar ≈ -0,50; sisi pada x layar ≈ ±0,55.
  kiriJauh: [-290, -TINGGI_MATA, -454],
  depan: [0, -TINGGI_MATA, -454],
  kananJauh: [290, -TINGGI_MATA, -454],
  // Baris bawah: y layar ≈ -0,72; sisi pada x layar ≈ ±0,45.
  kiriDekat: [-165, -TINGGI_MATA, -315],
  kananDekat: [165, -TINGGI_MATA, -315],
};
