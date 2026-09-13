# Tur Virtual 360° Rumah Sakit

Tur virtual berjenjang: **halaman depan → lantai → ruangan → alat medis**.
Dibangun untuk PT. Global Promedika Services.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Kerangka | Next.js 16 (App Router, Turbopack) + React 19 |
| Tampilan 3D | three.js + @react-three/fiber + @react-three/drei |
| Gaya | Tailwind CSS v4 |
| Ikon | lucide-react |

## Menjalankan

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build produksi
npm test        # cek integritas data
npm run lint
```

## Struktur

```
app/
  page.tsx                 halaman muka
  tur/[scene]/page.tsx     satu rute untuk semua level, pra-render statis
  api/pano/[name]/         panorama equirectangular contoh (SVG 4096x2048)
  api/foto/[slug]/         foto alat contoh (SVG)
src/
  components/
    Header.jsx             logo gps + breadcrumb
    Viewer360.jsx          bola panorama, OrbitControls, penanda 3D
    Sidebar.jsx            navigasi kontekstual per level
    FloorplanMap.jsx       denah 2D yang bisa dilipat
    EquipmentModal.jsx     detail alat (dialog native)
    TourShell.jsx          perekat: viewer + sidebar + denah + modal
  data/hospitalData.js     scene, alat, denah
  data/hospitalData.test.mjs
```

## Cara kerja data

Satu bentuk objek untuk semua level. `parent` dipakai menghitung breadcrumb
dengan walk-up, jadi menambah lantai atau ruangan cukup menambah satu objek di
`src/data/hospitalData.js` tanpa mengubah kode.

```js
'ruang-radiologi': {
  id: 'ruang-radiologi',
  parent: 'lantai-2',
  level: 'room',                 // exterior | floor | room
  panorama: '/api/pano/ruang-radiologi',
  hotspots: [
    { type: 'equipment', ref: 'GPS-MRI-005', position: [-120, -20, -480] },
    { type: 'nav', to: 'lantai-2', label: 'Kembali ke Koridor', position: [0, -40, 480] },
  ],
}
```

`position` adalah koordinat `[x, y, z]` pada bola berjari-jari 500, sehingga
penanda dapat ditempatkan tepat di atas alat pada gambar panorama.

## Mengganti gambar contoh dengan foto asli

1. Simpan panorama **equirectangular** rasio 2:1 (mis. 4096x2048) di `public/panorama/`.
2. Ubah `panorama` pada scene terkait menjadi `/panorama/nama-berkas.jpg`.
3. Simpan foto alat di `public/alat/`, lalu ubah `src` pada `EquipmentModal.jsx`
   dari `/api/foto/${item.ref}` menjadi `item.foto`.
4. Sesuaikan `position` tiap hotspot agar pas dengan letak alat pada foto baru.

Rute `app/api/pano` dan `app/api/foto` dapat dihapus setelah foto asli terpasang.

## Terbitkan ke Vercel

Tanpa konfigurasi tambahan. Impor repositori di Vercel, atau:

```bash
npm i -g vercel
vercel
```

Seluruh halaman tur dipra-render menjadi HTML statis melalui
`generateStaticParams`, sehingga tidak ada pemanggilan fungsi server saat diakses.

## Catatan

- Data pada `hospitalData.js` masih data contoh. Pindahkan ke basis data atau CMS
  bila petugas non-teknis perlu memperbaruinya sendiri.
- Penanda di kanvas WebGL tidak masuk urutan fokus dokumen, karena itu daftar
  ruangan dan alat pada sidebar memakai sumber data yang sama agar tetap dapat
  dijangkau papan ketik dan pembaca layar.
