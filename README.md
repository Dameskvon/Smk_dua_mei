# SMK Dua Mei — Sistem Pemesanan & Pengadaan Barang

Platform digital internal untuk pengelolaan pemesanan dan pengadaan barang SMK Dua Mei, Yayasan Pendidikan Dua Mei.

---

## Prasyarat

Pastikan komputer sudah terinstall:

- **Node.js** versi 18 ke atas — [https://nodejs.org](https://nodejs.org) (pilih LTS)

Cek versi setelah install:

```bash
node -v
npm -v
```

---

## Cara Menjalankan

### 1. Ekstrak file zip

Ekstrak `smk-dua-mei.zip` ke folder pilihan, misalnya:

```
D:\smk-dua-mei\
```

### 2. Buka Terminal / CMD

Masuk ke folder hasil ekstrak:

```bash
cd D:\smk-dua-mei
```

### 3. Install dependencies

```bash
npm install
```

> Proses ini membutuhkan koneksi internet. Tunggu hingga selesai (1–2 menit).

### 4. Jalankan aplikasi

```bash
npm run dev
```

### 5. Buka di browser

```
http://localhost:3000
```

---

## Akun Login

| Username | Password    | Role           | Akses                                                |
|----------|-------------|----------------|------------------------------------------------------|
| `guru1`  | `guru123`   | Guru           | Pemesanan, Pengadaan, Riwayat, Katalog, Notifikasi   |
| `guru2`  | `guru123`   | Guru           | Pemesanan, Pengadaan, Riwayat, Katalog, Notifikasi   |
| `kepsek` | `kepsek123` | Kepala Sekolah | Dashboard, Persetujuan, Laporan, Riwayat, Notifikasi |
| `admin`  | `admin123`  | Admin TU       | Semua halaman                                        |

---

## Fitur Aplikasi

| Halaman          | URL           | Akses          | Keterangan                           |
|------------------|---------------|----------------|--------------------------------------|
| Beranda          | `/`           | Semua          | Halaman utama & informasi sistem     |
| Pemesanan Barang | `/pemesanan`  | Guru, Admin    | Form pengajuan pemesanan barang      |
| Pengadaan Barang | `/pengadaan`  | Guru, Admin    | Form pengajuan pengadaan barang baru |
| Riwayat          | `/riwayat`    | Semua          | Tracking status semua pengajuan      |
| Katalog          | `/katalog`    | Semua          | Daftar barang & stok                 |
| Notifikasi       | `/notifikasi` | Semua          | Pemberitahuan status pengajuan       |
| Dashboard        | `/dashboard`  | Kepsek, Admin  | Statistik & ringkasan data           |
| Persetujuan      | `/approval`   | Kepsek, Admin  | Alur persetujuan pengajuan           |
| Laporan          | `/laporan`    | Kepsek, Admin  | Laporan & rekap data                 |
| Manajemen Stok   | `/stok`       | Kepsek, Admin  | Kelola stok barang                   |

---

## Struktur Folder

```
smk-dua-mei/
├── src/
│   ├── app/            # Halaman (routing Next.js App Router)
│   │   ├── dashboard/
│   │   ├── pemesanan/
│   │   ├── pengadaan/
│   │   ├── riwayat/
│   │   ├── katalog/
│   │   ├── notifikasi/
│   │   ├── approval/
│   │   ├── laporan/
│   │   ├── stok/
│   │   └── login/
│   ├── components/     # Komponen reusable
│   │   ├── Sidebar.tsx
│   │   ├── ClientLayout.tsx
│   │   ├── ProtectedPage.tsx
│   │   └── StatusBadge.tsx
│   ├── lib/
│   │   ├── auth.tsx    # Sistem autentikasi & role
│   │   └── data.ts     # Data dummy & utilitas
│   └── types/
│       └── index.ts    # TypeScript types
├── public/             # Aset statis
├── package.json
├── tsconfig.json
└── README.md
```

---

## Teknologi

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| [Next.js](https://nextjs.org/) | 15 | Framework React (App Router) |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling utility-first |
| [Lucide React](https://lucide.dev/) | latest | Library icon SVG |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |

---

## Catatan

- Data yang digunakan adalah **data dummy** (tidak tersambung database)
- Login menggunakan **autentikasi lokal** berbasis `localStorage`
- Aplikasi ini untuk keperluan **demo / prototipe**
