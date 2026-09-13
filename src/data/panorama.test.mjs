import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import test from 'node:test';
import { getPanoramaPath, PANORAMA_BAWAAN } from './panorama.js';
import { rumahSakit } from './hospitalData.js';

const berkasPanorama = new Set(readdirSync('public/panorama').map((n) => `/panorama/${n}`));

test('jenis ruangan dipetakan ke panorama yang sesuai', () => {
  assert.equal(getPanoramaPath('ruang-ugd'), '/panorama/ugd.jpg');
  assert.equal(getPanoramaPath('Ruang CT-Scan'), '/panorama/radiologi.jpg');
  assert.equal(getPanoramaPath('ng-ok Ruang Operasi'), '/panorama/operasi.jpg');
  assert.equal(getPanoramaPath('Ruang ICU'), '/panorama/icu.jpg');
  assert.equal(getPanoramaPath('Laboratorium'), '/panorama/laboratorium.jpg');
});

test('koridor tiap lantai memakai panorama yang berbeda', () => {
  assert.equal(getPanoramaPath('koridor-lantai-1 Lantai 1 floor'), '/panorama/koridor-lantai-1.jpg');
  assert.equal(getPanoramaPath('ng-koridor-2 Lantai 2 floor'), '/panorama/koridor-lantai-2.jpg');
});

test('ruangan tak dikenal tetap mendapat panorama bawaan', () => {
  assert.equal(getPanoramaPath('bangsal-anggrek-blok-z'), PANORAMA_BAWAAN);
  assert.equal(getPanoramaPath(''), PANORAMA_BAWAAN);
  assert.equal(getPanoramaPath(), PANORAMA_BAWAAN);
});

test('setiap scene menunjuk berkas panorama yang benar-benar ada', () => {
  for (const rs of rumahSakit) {
    for (const s of Object.values(rs.scenes)) {
      assert.ok(s.panorama, `${rs.id}/${s.id} tidak punya panorama`);
      assert.ok(berkasPanorama.has(s.panorama), `${rs.id}/${s.id} menunjuk berkas hilang: ${s.panorama}`);
    }
  }
});

test('setiap alat punya foto', () => {
  for (const rs of rumahSakit) {
    for (const a of Object.values(rs.equipment)) {
      assert.ok(a.equipmentImage, `${a.ref} tidak punya foto`);
    }
  }
});
