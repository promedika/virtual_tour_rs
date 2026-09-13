// Pemeriksaan keutuhan data seluruh rumah sakit.
// Jalankan: npm test
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  daftarRumahSakit,
  getBreadcrumb,
  getFloorplanFor,
  getNavTree,
  getRumahSakit,
  jatuhTempoKalibrasi,
  semuaScene,
} from './hospitalData.js';

const SEMUA = daftarRumahSakit.map((r) => getRumahSakit(r.id));

test('setiap rumah sakit memenuhi bentuk antarmuka yang sama', () => {
  assert.ok(SEMUA.length >= 2, 'perlu minimal dua rumah sakit');
  const KOLOM = ['id', 'name', 'profil', 'scenes', 'floorplans', 'equipment', 'calibrationHistory', 'maintenanceHistory'];
  for (const rs of SEMUA) {
    for (const kolom of KOLOM) {
      assert.ok(kolom in rs, `kolom ${kolom} hilang pada ${rs.id}`);
    }
    assert.equal(rs.id, rs.profil.id, `id tidak selaras pada ${rs.id}`);
    assert.ok(rs.scenes[rs.profil.sceneAwal], `sceneAwal tidak ada pada ${rs.id}`);
  }
});

test('id rumah sakit tidak kembar', () => {
  const id = SEMUA.map((r) => r.id);
  assert.equal(new Set(id).size, id.length, 'ada id rumah sakit yang kembar');
});

test('setiap parent scene benar-benar ada', () => {
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      if (s.parent !== null) {
        assert.ok(rs.scenes[s.parent], `${rs.id}: parent tidak dikenal pada ${s.id}`);
      }
    }
  }
});

test('hotspot navigasi dan alat selalu merujuk data yang ada', () => {
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      for (const h of s.hotspots) {
        if (h.type === 'nav') {
          assert.ok(rs.scenes[h.to], `${rs.id}: tujuan tidak dikenal "${h.to}" di ${s.id}`);
        } else {
          assert.ok(rs.equipment[h.ref], `${rs.id}: alat tidak dikenal "${h.ref}" di ${s.id}`);
        }
      }
    }
  }
});

test('posisi hotspot berupa tiga angka', () => {
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      for (const h of s.hotspots) {
        assert.equal(h.position.length, 3, `${rs.id}: posisi tidak lengkap di ${s.id}`);
        for (const n of h.position) assert.equal(typeof n, 'number', `${rs.id}: posisi bukan angka di ${s.id}`);
      }
    }
  }
});

test('panah navigasi berdiri pada satu bidang lantai yang sama', () => {
  // Tinggi seragam mencegah panah tampak melayang atau tenggelam di lantai.
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      for (const h of s.hotspots.filter((x) => x.type === 'nav')) {
        assert.equal(h.position[1], -165, `${rs.id}: panah ${s.id} tidak di bidang lantai`);
      }
    }
  }
});

test('berkas panorama dan foto alat tersedia di public/', () => {
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      const p = path.join(process.cwd(), 'public', s.panorama.replace(/^\//, ''));
      assert.ok(existsSync(p), `${rs.id}: panorama hilang ${s.panorama}`);
    }
    for (const a of Object.values(rs.equipment)) {
      const f = path.join(process.cwd(), 'public', a.equipmentImage.replace(/^\//, ''));
      assert.ok(existsSync(f), `${rs.id}: foto alat hilang ${a.equipmentImage}`);
    }
  }
});

test('denah ditemukan lewat lantai induk saat scene adalah ruangan', () => {
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      if (s.level === 'exterior') continue;
      const denah = getFloorplanFor(rs.id, s.id);
      assert.ok(denah, `${rs.id}: denah tidak ditemukan untuk ${s.id}`);
      assert.ok(rs.floorplans[denah.key], `${rs.id}: kunci denah tidak dikenal ${denah.key}`);
    }
  }
});

test('pin denah menunjuk scene yang valid', () => {
  for (const rs of SEMUA) {
    for (const [kunci, denah] of Object.entries(rs.floorplans)) {
      for (const r of denah.rooms) {
        assert.ok(rs.scenes[r.id], `${rs.id}: denah ${kunci} menunjuk scene tak dikenal ${r.id}`);
      }
    }
  }
});

test('breadcrumb dimulai dari akar dan berakhir pada scene itu sendiri', () => {
  for (const rs of SEMUA) {
    for (const s of Object.values(rs.scenes)) {
      const trail = getBreadcrumb(rs.id, s.id);
      assert.equal(trail.at(-1).id, s.id, `${rs.id}: ujung breadcrumb salah pada ${s.id}`);
      assert.equal(trail[0].parent, null, `${rs.id}: breadcrumb tidak dimulai dari akar pada ${s.id}`);
    }
  }
});

test('pohon navigasi memuat gedung, lantai, ruangan, dan alat', () => {
  for (const rs of SEMUA) {
    const pohon = getNavTree(rs.id);
    assert.ok(pohon.length > 0, `${rs.id}: pohon navigasi kosong`);
    const ruangan = pohon.flatMap((g) => g.floors).flatMap((f) => f.rooms);
    assert.ok(ruangan.length > 0, `${rs.id}: tidak ada ruangan di pohon`);
    for (const r of ruangan) {
      assert.ok(r.equipment.length > 0, `${rs.id}: ruangan tanpa alat ${r.id}`);
    }
  }
});

test('data alat memuat kolom log kalibrasi yang wajib', () => {
  const WAJIB = ['AlatNama', 'AlatMerk', 'AlatTipe', 'AlatSeri', 'LabelNoBaru', 'Barcode', 'KalibDate', 'KalibRoom', 'Keterangan', 'PetugasNik'];
  for (const rs of SEMUA) {
    for (const [ref, a] of Object.entries(rs.equipment)) {
      assert.equal(a.ref, ref, `${rs.id}: ref tidak selaras pada ${ref}`);
      for (const k of WAJIB) {
        assert.ok(a[k], `${rs.id}: kolom ${k} kosong pada ${ref}`);
      }
      assert.ok(!Number.isNaN(Date.parse(a.KalibDate)), `${rs.id}: KalibDate tidak valid pada ${ref}`);
    }
  }
});

test('setiap alat punya riwayat kalibrasi dan pemeliharaan', () => {
  for (const rs of SEMUA) {
    for (const ref of Object.keys(rs.equipment)) {
      const kal = rs.calibrationHistory[ref];
      assert.ok(Array.isArray(kal) && kal.length > 0, `${rs.id}: riwayat kalibrasi kosong ${ref}`);
      for (const b of kal) {
        assert.ok(!Number.isNaN(Date.parse(b.date)), `${rs.id}: tanggal kalibrasi tidak valid ${ref}`);
        assert.ok(b.result && b.method && b.by, `${rs.id}: kolom kalibrasi kosong ${ref}`);
      }
      const rawat = rs.maintenanceHistory[ref];
      assert.ok(Array.isArray(rawat) && rawat.length > 0, `${rs.id}: riwayat pemeliharaan kosong ${ref}`);
    }
  }
});

test('jatuhTempoKalibrasi menghitung satu tahun bila KalibNext tidak diisi', () => {
  assert.equal(jatuhTempoKalibrasi({ KalibDate: '2026-03-04' }), '2027-03-04');
  assert.equal(jatuhTempoKalibrasi({ KalibDate: '2026-03-04', KalibNext: '2026-09-01' }), '2026-09-01');
});

test('semuaScene menghasilkan parameter rute untuk seluruh rumah sakit', () => {
  const daftar = semuaScene();
  const harapan = SEMUA.reduce((n, rs) => n + Object.keys(rs.scenes).length, 0);
  assert.equal(daftar.length, harapan, 'jumlah parameter rute tidak sesuai');
  for (const p of daftar) {
    const rs = getRumahSakit(p.rs);
    assert.equal(rs.id, p.rs, `rumah sakit tidak dikenal ${p.rs}`);
    assert.ok(rs.scenes[p.scene], `scene tidak dikenal ${p.scene}`);
  }
});
