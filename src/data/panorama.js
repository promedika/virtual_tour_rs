// Pemeta panorama bawaan.
//
// Rumah sakit, gedung, lantai, ruangan, atau alat yang baru ditambahkan belum
// tentu memiliki foto 360° sendiri. Berkas ini memilihkan panorama yang paling
// mendekati jenis ruangannya, sehingga scene baru tetap tampil utuh tanpa
// menunggu foto asli dan tanpa perubahan kode di tempat lain.

/** Panorama yang dipakai bila tidak ada pola yang cocok. */
export const PANORAMA_BAWAAN = '/panorama/lobby.jpg';

/** Foto alat yang dipakai bila alat belum memiliki foto sendiri. */
export const FOTO_ALAT_BAWAAN = '/alat/_default.jpg';

// Urutan penting: pola yang lebih khusus diletakkan lebih dulu.
// "lantai 2" harus diperiksa sebelum "koridor" agar koridor lantai atas
// tidak tertangkap pola koridor lantai 1.
const POLA = [
  [/ugd|igd|emergen|gawat/i, '/panorama/ugd.jpg'],
  [/radiolog|ct[\s-]?scan|mri|x[\s-]?ray|rontgen|radioterapi|imaging/i, '/panorama/radiologi.jpg'],
  [/operasi|\bok\b|bedah|surgery/i, '/panorama/operasi.jpg'],
  [/icu|iccu|nicu|picu|intensif|intensive/i, '/panorama/icu.jpg'],
  [/lab|patologi|mikrobiolog/i, '/panorama/laboratorium.jpg'],
  [/exterior|halaman|gerbang|luar|taman|parkir/i, '/panorama/exterior.jpg'],
  [/lantai[\s-]*2|floor\s*2/i, '/panorama/koridor-lantai-2.jpg'],
  [/koridor|corridor|lorong|lantai[\s-]*1|floor\s*1/i, '/panorama/koridor-lantai-1.jpg'],
  [/lobi|lobby|pendaftaran|administrasi|sokasi|poli|rawat|ruang/i, '/panorama/lobby.jpg'],
];


/**
 * Panorama yang cocok untuk sebuah ruangan.
 * @param {string} roomType kata kunci bebas: id, nama, jenis lantai, atau gabungannya.
 * @returns {string} alamat berkas panorama di folder public.
 */
export function getPanoramaPath(roomType = '') {
  const teks = String(roomType);
  for (const [pola, berkas] of POLA) if (pola.test(teks)) return berkas;
  return PANORAMA_BAWAAN;
}
