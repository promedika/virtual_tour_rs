// RSUP Prof. Dr. I.G.N.G. Ngoerah â€” Denpasar, Bali
// ponytail: data contoh. Ganti dengan keluaran basis data saat backend siap.
import { SLOT, benda } from '../geometri.js';

export const profil = {
  id: 'ngoerah',
  nama: 'RSUP Ngoerah Denpasar',
  namaPanjang: 'RSUP Prof. Dr. I.G.N.G. Ngoerah',
  wilayah: 'Denpasar, Bali',
  kelas: 'Rumah Sakit Umum Pusat Kelas A',
  sceneAwal: 'ng-exterior',
};

export const scenes = {
  'ng-exterior': {
    id: 'ng-exterior',
    name: 'Gerbang Utama',
    parent: null,
    level: 'exterior',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    hotspots: [{ type: 'nav', to: 'ng-lobby', label: 'Masuk Lobi', position: SLOT.depan }],
  },

  'ng-lobby': {
    id: 'ng-lobby',
    name: 'Lobi Pendaftaran',
    parent: 'ng-exterior',
    level: 'floor',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-1',
    hotspots: [
      { type: 'nav', to: 'ng-koridor-1', label: 'Koridor Lantai 1', position: SLOT.kiriJauh },
      { type: 'nav', to: 'ng-exterior', label: 'Keluar Gedung', position: SLOT.kananDekat },
    ],
  },

  'ng-koridor-1': {
    id: 'ng-koridor-1',
    name: 'Lantai 1',
    parent: 'ng-lobby',
    level: 'floor',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-1',
    hotspots: [
      { type: 'nav', to: 'ng-ct-scan', label: 'Ruang CT-Scan', position: SLOT.kiriJauh },
      { type: 'nav', to: 'ng-radioterapi', label: 'Ruang Radioterapi', position: SLOT.kananJauh },
      { type: 'nav', to: 'ng-koridor-2', label: 'Ke Lantai 2', position: SLOT.kananDekat },
      { type: 'nav', to: 'ng-lobby', label: 'Kembali ke Lobi', position: SLOT.kiriDekat },
    ],
  },

  'ng-koridor-2': {
    id: 'ng-koridor-2',
    name: 'Lantai 2',
    parent: 'ng-koridor-1',
    level: 'floor',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-2',
    hotspots: [
      { type: 'nav', to: 'ng-ok', label: 'Ruang Operasi (OK)', position: SLOT.kiriJauh },
      { type: 'nav', to: 'ng-icu', label: 'Ruang ICU', position: SLOT.kananJauh },
      { type: 'nav', to: 'ng-koridor-1', label: 'Ke Lantai 1', position: SLOT.kiriDekat },
    ],
  },

  'ng-ct-scan': {
    id: 'ng-ct-scan',
    name: 'Ruang CT-Scan',
    parent: 'ng-koridor-1',
    level: 'room',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-1',
    hotspots: [
      { type: 'equipment', ref: 'NGR-CTS-001', position: benda(-16, 430, -30) },
      { type: 'equipment', ref: 'NGR-PMN-004', position: benda(20, 380, -50) },
      { type: 'nav', to: 'ng-koridor-1', label: 'Kembali ke Koridor', position: SLOT.kiriDekat },
    ],
  },

  'ng-radioterapi': {
    id: 'ng-radioterapi',
    name: 'Ruang Radioterapi',
    parent: 'ng-koridor-1',
    level: 'room',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-1',
    hotspots: [
      { type: 'equipment', ref: 'NGR-LNC-005', position: benda(-16, 430, -20) },
      { type: 'equipment', ref: 'NGR-INF-006', position: benda(22, 370, -60) },
      { type: 'nav', to: 'ng-koridor-1', label: 'Kembali ke Koridor', position: SLOT.kiriDekat },
    ],
  },

  'ng-ok': {
    id: 'ng-ok',
    name: 'Ruang Operasi (OK)',
    parent: 'ng-koridor-2',
    level: 'room',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-2',
    hotspots: [
      { type: 'equipment', ref: 'NGR-ANS-002', position: benda(-30, 400, -40) },
      { type: 'equipment', ref: 'NGR-MJO-003', position: benda(0, 380, -110) },
      { type: 'equipment', ref: 'NGR-LMP-007', position: benda(30, 400, 120) },
      { type: 'nav', to: 'ng-koridor-2', label: 'Kembali ke Koridor', position: SLOT.kiriDekat },
    ],
  },

  'ng-icu': {
    id: 'ng-icu',
    name: 'Ruang ICU',
    parent: 'ng-koridor-2',
    level: 'room',
    building: 'Gedung Utama',
    credit: 'Poly Haven (CC0)',
    floorplan: 'ng-lantai-2',
    hotspots: [
      { type: 'equipment', ref: 'NGR-VNT-008', position: benda(-30, 400, -40) },
      { type: 'equipment', ref: 'NGR-PMN-004', position: benda(0, 400, -30) },
      { type: 'equipment', ref: 'NGR-SYP-009', position: benda(30, 380, -70) },
      { type: 'nav', to: 'ng-koridor-2', label: 'Kembali ke Koridor', position: SLOT.kiriDekat },
    ],
  },
};

/** Alat medis â€” mengikuti format lembar kalibrasi. */
export const equipment = {
  'NGR-CTS-001': {
    ref: 'NGR-CTS-001',
    equipmentImage: '/alat/GPS-CTS-006.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA 3.0',
    AlatNama: 'CT-Scan 128 Slice',
    AlatMerk: 'Siemens Healthineers',
    AlatTipe: 'SOMATOM go.Top',
    AlatSeri: 'SMS-20210408-CT',
    LabelNoBaru: 'NGR/L1/CTS/001',
    Barcode: '8112233400012',
    KalibDate: '2026-01-22',
    KalibNext: '2027-01-22',
    KalibRoom: 'Ruang CT-Scan',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5103041507880002',
    maintenance: [
      { date: '2026-01-22', action: 'Uji CTDI, akurasi nomor CT, dan keseragaman citra', by: 'Teknisi GPS Â· NIK 5103041507880002' },
      { date: '2025-07-14', action: 'Penggantian tabung pendingin dan pembaruan perangkat lunak', by: 'Teknisi GPS Â· NIK 5103041507880002' },
    ],
  },
  'NGR-ANS-002': {
    ref: 'NGR-ANS-002',
    equipmentImage: '/alat/GPS-ANS-011.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA',
    AlatNama: 'Mesin Anestesi',
    AlatMerk: 'DrÃ¤ger',
    AlatTipe: 'Fabius Plus',
    AlatSeri: 'DRG-20220119-AN',
    LabelNoBaru: 'NGR/L2/OKA/002',
    Barcode: '8112233400029',
    KalibDate: '2026-02-16',
    KalibNext: '2027-02-16',
    KalibRoom: 'Ruang Operasi (OK)',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5103041507880002',
    maintenance: [
      { date: '2026-02-16', action: 'Uji kebocoran sirkuit dan konsentrasi vaporizer', by: 'Teknisi GPS Â· NIK 5103041507880002' },
      { date: '2025-08-23', action: 'Penggantian penyerap karbon dioksida', by: 'Teknisi GPS Â· NIK 5171062003920004' },
    ],
  },
  'NGR-MJO-003': {
    ref: 'NGR-MJO-003',
    equipmentImage: '/alat/GPS-MJO-010.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA',
    AlatNama: 'Meja Operasi Elektrik',
    AlatMerk: 'Mindray',
    AlatTipe: 'HyBase 8100',
    AlatSeri: 'MDR-20230210-MO',
    LabelNoBaru: 'NGR/L2/OKA/003',
    Barcode: '8112233400036',
    KalibDate: '2026-02-16',
    KalibNext: '2027-02-16',
    KalibRoom: 'Ruang Operasi (OK)',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5171062003920004',
    maintenance: [
      { date: '2026-02-16', action: 'Uji sudut kemiringan dan beban aman 250 kg', by: 'Teknisi GPS Â· NIK 5171062003920004' },
    ],
  },
  'NGR-PMN-004': {
    ref: 'NGR-PMN-004',
    equipmentImage: '/alat/GPS-PMN-013.jpg',
    imageCredit: 'Wikimedia Commons Â· Public domain',
    AlatNama: 'Bed Side Monitor',
    AlatMerk: 'Philips',
    AlatTipe: 'IntelliVue MX550',
    AlatSeri: 'PHL-20230512-BM',
    LabelNoBaru: 'NGR/L2/ICU/004',
    Barcode: '8112233400043',
    KalibDate: '2026-03-03',
    KalibNext: '2027-03-03',
    KalibRoom: 'Ruang ICU',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5103041507880002',
    maintenance: [
      { date: '2026-03-03', action: 'Kalibrasi SpO2, NIBP, dan EKG', by: 'Teknisi GPS Â· NIK 5103041507880002' },
    ],
  },
  'NGR-LNC-005': {
    ref: 'NGR-LNC-005',
    equipmentImage: '/alat/GPS-MRI-005.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA',
    AlatNama: 'Linear Accelerator',
    AlatMerk: 'Varian',
    AlatTipe: 'Clinac iX',
    AlatSeri: 'VRN-20200916-LA',
    LabelNoBaru: 'NGR/L1/RDT/005',
    Barcode: '8112233400050',
    KalibDate: '2026-01-09',
    KalibNext: '2027-01-09',
    KalibRoom: 'Ruang Radioterapi',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5103041507880002',
    maintenance: [
      { date: '2026-01-09', action: 'Verifikasi keluaran dosis dan uji kesesuaian berkas', by: 'Teknisi GPS Â· NIK 5103041507880002' },
    ],
  },
  'NGR-INF-006': {
    ref: 'NGR-INF-006',
    equipmentImage: '/alat/SJW-INF-005.jpg',
    imageCredit: 'Wikimedia Commons Â· CC0',
    AlatNama: 'Infusion Pump',
    AlatMerk: 'B. Braun',
    AlatTipe: 'Infusomat Space',
    AlatSeri: 'BBR-20230825-IP',
    LabelNoBaru: 'NGR/L1/RDT/006',
    Barcode: '8112233400067',
    KalibDate: '2026-02-28',
    KalibNext: '2027-02-28',
    KalibRoom: 'Ruang Radioterapi',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5171062003920004',
    maintenance: [
      { date: '2026-02-28', action: 'Kalibrasi laju alir dan uji alarm oklusi', by: 'Teknisi GPS Â· NIK 5171062003920004' },
    ],
  },
  'NGR-LMP-007': {
    ref: 'NGR-LMP-007',
    equipmentImage: '/alat/GPS-LMP-012.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA',
    AlatNama: 'Lampu Operasi',
    AlatMerk: 'DrÃ¤ger',
    AlatTipe: 'Polaris 600',
    AlatSeri: 'DRG-20220119-LO',
    LabelNoBaru: 'NGR/L2/OKA/007',
    Barcode: '8112233400074',
    KalibDate: '2026-02-16',
    KalibNext: '2027-02-16',
    KalibRoom: 'Ruang Operasi (OK)',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5171062003920004',
    maintenance: [
      { date: '2026-02-16', action: 'Pengukuran iluminasi pada titik fokus', by: 'Teknisi GPS Â· NIK 5171062003920004' },
    ],
  },
  'NGR-VNT-008': {
    ref: 'NGR-VNT-008',
    equipmentImage: '/alat/GPS-VNT-014.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA',
    AlatNama: 'Ventilator Mekanik',
    AlatMerk: 'DrÃ¤ger',
    AlatTipe: 'Evita V300',
    AlatSeri: 'DRG-20210604-VT',
    LabelNoBaru: 'NGR/L2/ICU/008',
    Barcode: '8112233400081',
    KalibDate: '2026-03-03',
    KalibNext: '2027-03-03',
    KalibRoom: 'Ruang ICU',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5103041507880002',
    maintenance: [
      { date: '2026-03-03', action: 'Uji volume tidal dan tekanan jalan napas', by: 'Teknisi GPS Â· NIK 5103041507880002' },
    ],
  },
  'NGR-SYP-009': {
    ref: 'NGR-SYP-009',
    equipmentImage: '/alat/GPS-SYP-015.jpg',
    imageCredit: 'Wikimedia Commons Â· CC BY-SA',
    AlatNama: 'Syringe Pump',
    AlatMerk: 'Terumo',
    AlatTipe: 'TE-SS830',
    AlatSeri: 'TRM-20230714-SP',
    LabelNoBaru: 'NGR/L2/ICU/009',
    Barcode: '8112233400098',
    KalibDate: '2026-03-03',
    KalibNext: '2027-03-03',
    KalibRoom: 'Ruang ICU',
    Keterangan: 'LAIK PAKAI',
    PetugasNik: '5171062003920004',
    maintenance: [
      { date: '2026-03-03', action: 'Kalibrasi laju alir dan uji alarm oklusi', by: 'Teknisi GPS Â· NIK 5171062003920004' },
    ],
  },
};

/** Riwayat kalibrasi, terpisah dari pemeliharaan agar tampil pada tab tersendiri. */
export const calibrationHistory = {
  'NGR-CTS-001': [
    { date: '2026-01-22', result: 'LAIK PAKAI', method: 'Uji CTDI dan akurasi nomor CT', deviation: 'Â± 3 HU', by: 'NIK 5103041507880002' },
    { date: '2025-01-20', result: 'LAIK PAKAI', method: 'Uji CTDI dan akurasi nomor CT', deviation: 'Â± 4 HU', by: 'NIK 5103041507880002' },
  ],
  'NGR-ANS-002': [
    { date: '2026-02-16', result: 'LAIK PAKAI', method: 'Uji konsentrasi vaporizer dan kebocoran sirkuit', deviation: 'Â± 0,2 vol %', by: 'NIK 5103041507880002' },
  ],
  'NGR-MJO-003': [
    { date: '2026-02-16', result: 'LAIK PAKAI', method: 'Uji sudut kemiringan dan beban aman', deviation: 'Â± 1Â°', by: 'NIK 5171062003920004' },
  ],
  'NGR-PMN-004': [
    { date: '2026-03-03', result: 'LAIK PAKAI', method: 'Simulator pasien untuk SpO2, NIBP, dan EKG', deviation: 'Â± 2 %', by: 'NIK 5103041507880002' },
  ],
  'NGR-LNC-005': [
    { date: '2026-01-09', result: 'LAIK PAKAI', method: 'Verifikasi keluaran dosis dengan bilik ionisasi', deviation: 'Â± 2 %', by: 'NIK 5103041507880002' },
  ],
  'NGR-INF-006': [
    { date: '2026-02-28', result: 'LAIK PAKAI', method: 'Timbangan gravimetri laju alir', deviation: 'Â± 3 %', by: 'NIK 5171062003920004' },
  ],
  'NGR-LMP-007': [
    { date: '2026-02-16', result: 'LAIK PAKAI', method: 'Luxmeter pada jarak fokus 1 meter', deviation: 'Â± 5 %', by: 'NIK 5171062003920004' },
  ],
  'NGR-VNT-008': [
    { date: '2026-03-03', result: 'LAIK PAKAI', method: 'Analyzer gas dan aliran acuan', deviation: 'Â± 5 mL', by: 'NIK 5103041507880002' },
  ],
  'NGR-SYP-009': [
    { date: '2026-03-03', result: 'LAIK PAKAI', method: 'Timbangan gravimetri laju alir', deviation: 'Â± 2 %', by: 'NIK 5171062003920004' },
  ],
};

export const floorplans = {
  'ng-lantai-1': {
    name: 'Denah Lantai 1',
    rooms: [
      { id: 'ng-lobby', label: 'Lobi', x: 50, y: 80, w: 46, h: 18 },
      { id: 'ng-koridor-1', label: 'Koridor', x: 50, y: 56, w: 80, h: 12 },
      { id: 'ng-ct-scan', label: 'CT-Scan', x: 26, y: 28, w: 34, h: 30 },
      { id: 'ng-radioterapi', label: 'Radioterapi', x: 72, y: 28, w: 34, h: 30 },
    ],
  },
  'ng-lantai-2': {
    name: 'Denah Lantai 2',
    rooms: [
      { id: 'ng-koridor-2', label: 'Koridor', x: 50, y: 74, w: 80, h: 12 },
      { id: 'ng-ok', label: 'Operasi (OK)', x: 28, y: 38, w: 36, h: 34 },
      { id: 'ng-icu', label: 'ICU', x: 72, y: 38, w: 36, h: 34 },
    ],
  },
};
