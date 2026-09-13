// Daftar rumah sakit dan seluruh fungsi pembacaan data.
//
// Setiap berkas di src/data/rs/ mengikuti satu bentuk yang sama:
//   profil, scenes, floorplans, equipment, calibrationHistory
// Berkas baru cukup diletakkan di folder itu lalu didaftarkan pada SUMBER
// di bawah. Tidak ada rute yang perlu diubah.
import * as gianyar from './rs/gianyar.js';
import * as ngoerah from './rs/ngoerah.js';
import { FOTO_ALAT_BAWAAN, getPanoramaPath } from './panorama.js';

export { benda, lantai, TINGGI_MATA } from './geometri.js';
export { getPanoramaPath } from './panorama.js';

const SUMBER = [gianyar, ngoerah];

/**
 * Menyusun satu berkas rumah sakit menjadi bentuk baku.
 * maintenanceHistory diturunkan dari field `maintenance` pada tiap alat supaya
 * riwayat kalibrasi dan pemeliharaan dapat dibaca dengan cara yang sama.
 */
function bakukan(mod) {
  // Alat tanpa foto memakai gambar bawaan agar <Image> tidak menerima src kosong.
  const equipment = Object.fromEntries(
    Object.entries(mod.equipment ?? {}).map(([ref, a]) => [
      ref,
      { ...a, equipmentImage: a.equipmentImage || FOTO_ALAT_BAWAAN },
    ])
  );
  const maintenanceHistory = Object.fromEntries(
    Object.values(equipment).map((a) => [a.ref, a.maintenance ?? []])
  );

  // Scene tanpa panorama sendiri dicarikan yang paling mendekati jenis ruangannya,
  // sehingga ruangan baru langsung tampil tanpa menunggu foto asli.
  const scenes = Object.fromEntries(
    Object.entries(mod.scenes ?? {}).map(([id, s]) => [
      id,
      { ...s, panorama: s.panorama || getPanoramaPath(`${s.id} ${s.name} ${s.level ?? ''}`) },
    ])
  );

  return {
    id: mod.profil.id,
    name: mod.profil.nama,
    profil: mod.profil,
    scenes,
    floorplans: mod.floorplans ?? {},
    equipment,
    calibrationHistory: mod.calibrationHistory ?? {},
    maintenanceHistory,
  };
}

/** Seluruh rumah sakit yang terdaftar. */
export const rumahSakit = SUMBER.map(bakukan);

/** Ringkasan untuk pemilih rumah sakit pada header. */
export const daftarRumahSakit = rumahSakit.map(({ id, profil }) => ({
  id,
  nama: profil.nama,
  wilayah: profil.wilayah,
  sceneAwal: profil.sceneAwal,
}));

/** Data satu rumah sakit. Bila id tidak dikenal, yang pertama dipakai. */
export function getRumahSakit(id) {
  return rumahSakit.find((r) => r.id === id) ?? rumahSakit[0];
}

/**
 * Gabungan seluruh alat dan riwayatnya, dikunci nomor acuan alat.
 * Nomor acuan sudah unik antar rumah sakit (GPS-, SJW-, NGR-), sehingga
 * modal rincian dapat membaca riwayat tanpa perlu tahu rumah sakit aktif.
 */
export const equipment = Object.assign({}, ...rumahSakit.map((r) => r.equipment));
export const calibrationHistory = Object.assign({}, ...rumahSakit.map((r) => r.calibrationHistory));
export const maintenanceHistory = Object.assign({}, ...rumahSakit.map((r) => r.maintenanceHistory));

/** Pasangan {rs, scene} untuk generateStaticParams. */
export function semuaScene() {
  return rumahSakit.flatMap((r) => Object.keys(r.scenes).map((scene) => ({ rs: r.id, scene })));
}

/** Jejak dari scene teratas sampai scene ini, lewat relasi parent. */
export function getBreadcrumb(rsId, sceneId) {
  const { scenes } = getRumahSakit(rsId);
  const trail = [];
  let cur = scenes[sceneId];
  while (cur) {
    trail.unshift(cur);
    cur = cur.parent ? scenes[cur.parent] : null;
  }
  return trail;
}

/** Scene yang induknya adalah sceneId. */
export function getChildren(rsId, sceneId) {
  return Object.values(getRumahSakit(rsId).scenes).filter((s) => s.parent === sceneId);
}

/**
 * Denah yang berlaku untuk scene ini. Ditelusuri dari scene aktif ke atas:
 * ruangan mewarisi denah lantai induknya melalui field `floorplan`.
 */
export function getFloorplanFor(rsId, sceneId) {
  const { floorplans } = getRumahSakit(rsId);
  for (const s of getBreadcrumb(rsId, sceneId).slice().reverse()) {
    const key = s.floorplan ?? s.id;
    if (floorplans[key]) return { key, ...floorplans[key] };
  }
  return null;
}

/** Daftar alat pada satu scene, mengikuti urutan penanda. */
export function getEquipmentIn(rsId, sceneId) {
  const rs = getRumahSakit(rsId);
  const s = rs.scenes[sceneId];
  if (!s) return [];
  return s.hotspots
    .filter((h) => h.type === 'equipment')
    .map((h) => rs.equipment[h.ref])
    .filter(Boolean);
}

/**
 * Pohon navigasi: Gedung → Lantai → Ruangan → Alat.
 * Dibentuk dari relasi `parent` sehingga penambahan lantai atau ruangan
 * pada berkas data langsung muncul tanpa penyesuaian kode.
 */
export function getNavTree(rsId) {
  const rs = getRumahSakit(rsId);
  const lantai = Object.values(rs.scenes).filter((s) => s.level === 'floor');
  const gedung = [...new Set(lantai.map((f) => f.building ?? 'Gedung Utama'))];

  return gedung.map((nama) => ({
    id: `gedung-${nama.toLowerCase().replace(/\s+/g, '-')}`,
    label: nama,
    floors: lantai
      .filter((f) => (f.building ?? 'Gedung Utama') === nama)
      .map((f) => ({
        id: f.id,
        label: f.name,
        rooms: getChildren(rsId, f.id)
          .filter((r) => r.level === 'room')
          .map((r) => ({ id: r.id, label: r.name, equipment: getEquipmentIn(rsId, r.id) })),
      })),
  }));
}

/**
 * Jatuh tempo kalibrasi berikutnya.
 * Memakai KalibNext bila dicatat; bila tidak, dihitung satu tahun
 * setelah kalibrasi terakhir sesuai daur kalibrasi tahunan.
 */
export function jatuhTempoKalibrasi(alat) {
  if (!alat) return null;
  if (alat.KalibNext) return alat.KalibNext;
  if (!alat.KalibDate) return null;
  const d = new Date(alat.KalibDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
