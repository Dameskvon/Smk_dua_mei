import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.approvalStep.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.barangItem.deleteMany();
  await prisma.pemesanan.deleteMany();
  await prisma.pengadaan.deleteMany();
  await prisma.katalogBarang.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { id: "u1", username: "guru1", password: "guru123", nama: "Budi Santoso, S.Pd.", jabatan: "Guru Matematika", unitDepartemen: "Jurusan MIPA", role: "guru" },
      { id: "u2", username: "guru2", password: "guru123", nama: "Siti Rahayu, S.Pd.", jabatan: "Guru Bahasa Indonesia", unitDepartemen: "Jurusan Bahasa", role: "guru" },
      { id: "u3", username: "kepsek", password: "kepsek123", nama: "Drs. H. Ahmad Fauzi, M.Pd.", jabatan: "Kepala Sekolah", unitDepartemen: "Pimpinan", role: "kepala_sekolah" },
      { id: "u4", username: "admin", password: "admin123", nama: "Dewi Lestari, S.E.", jabatan: "Staff Tata Usaha", unitDepartemen: "Tata Usaha", role: "admin" },
      { id: "u5", username: "adminit", password: "adminit123", nama: "Reza Firmansyah, S.Kom.", jabatan: "Staff Admin IT", unitDepartemen: "IT & Teknologi", role: "admin_it" },
    ],
  });

  await prisma.katalogBarang.createMany({
    data: [
      { id: "k1", namaBarang: "Kertas A4 80gr", kategori: "Alat Tulis & Kertas", stok: 45, satuan: "Rim", hargaSatuan: 55000, deskripsi: "Kertas HVS A4 80gr untuk keperluan cetak", minStok: 10, gambarEmoji: "file-text" },
      { id: "k2", namaBarang: "Pulpen Ballpoint", kategori: "Alat Tulis & Kertas", stok: 120, satuan: "Pcs", hargaSatuan: 3500, deskripsi: "Pulpen Pilot BP-S warna biru dan hitam", minStok: 30, gambarEmoji: "pen-tool" },
      { id: "k3", namaBarang: "Spidol Whiteboard", kategori: "Alat Tulis & Kertas", stok: 8, satuan: "Pcs", hargaSatuan: 8500, deskripsi: "Spidol papan tulis warna hitam, merah, biru", minStok: 20, gambarEmoji: "highlighter" },
      { id: "k4", namaBarang: "Tinta Printer Hitam", kategori: "Alat Tulis & Kertas", stok: 12, satuan: "Cartridge", hargaSatuan: 120000, deskripsi: "Cartridge tinta hitam untuk printer Canon", minStok: 5, gambarEmoji: "printer" },
      { id: "k5", namaBarang: "Laptop Core i5", kategori: "Peralatan Elektronik", stok: 5, satuan: "Unit", hargaSatuan: 7500000, deskripsi: "Laptop Intel Core i5 Gen 11, RAM 8GB, SSD 256GB", minStok: 2, gambarEmoji: "laptop" },
      { id: "k6", namaBarang: "Proyektor LCD", kategori: "Peralatan Elektronik", stok: 3, satuan: "Unit", hargaSatuan: 4500000, deskripsi: "Proyektor 3500 lumen, HDMI, WiFi connectivity", minStok: 1, gambarEmoji: "projector" },
      { id: "k7", namaBarang: "Mouse Wireless", kategori: "Peralatan Elektronik", stok: 25, satuan: "Buah", hargaSatuan: 85000, deskripsi: "Mouse wireless 2.4GHz, daya tahan baterai 12 bulan", minStok: 10, gambarEmoji: "mouse" },
      { id: "k8", namaBarang: "Meja Belajar", kategori: "Furnitur & Perlengkapan", stok: 10, satuan: "Buah", hargaSatuan: 350000, deskripsi: "Meja belajar kayu 60x40cm", minStok: 5, gambarEmoji: "table" },
      { id: "k9", namaBarang: "Kursi Belajar", kategori: "Furnitur & Perlengkapan", stok: 0, satuan: "Buah", hargaSatuan: 250000, deskripsi: "Kursi belajar plastik dengan sandaran", minStok: 10, gambarEmoji: "armchair" },
      { id: "k10", namaBarang: "Papan Tulis", kategori: "Furnitur & Perlengkapan", stok: 2, satuan: "Buah", hargaSatuan: 850000, deskripsi: "Whiteboard ukuran 120x90cm", minStok: 2, gambarEmoji: "presentation" },
      { id: "k11", namaBarang: "Kabel UTP Cat6", kategori: "Peralatan Lab / Praktik", stok: 15, satuan: "Roll", hargaSatuan: 350000, deskripsi: "Kabel jaringan UTP Cat6 per 305m roll", minStok: 5, gambarEmoji: "cable" },
      { id: "k12", namaBarang: "Obat P3K", kategori: "Peralatan Medis / UKS", stok: 1, satuan: "Set", hargaSatuan: 200000, deskripsi: "Paket obat P3K lengkap untuk UKS", minStok: 3, gambarEmoji: "heart-pulse" },
      { id: "k13", namaBarang: "Sapu & Pel", kategori: "Perlengkapan Kebersihan", stok: 20, satuan: "Set", hargaSatuan: 75000, deskripsi: "Set kebersihan: sapu, pel, pengki", minStok: 5, gambarEmoji: "spray-can" },
      { id: "k14", namaBarang: "Sabun Cuci Tangan", kategori: "Perlengkapan Kebersihan", stok: 0, satuan: "Botol", hargaSatuan: 25000, deskripsi: "Sabun cuci tangan antiseptik 500ml", minStok: 20, gambarEmoji: "droplets" },
    ],
  });

  await prisma.pemesanan.create({
    data: {
      id: "p1", nomorPesanan: "PES/2024/001", tanggalPesan: "2024-11-01",
      namaPemesan: "Budi Santoso", jabatan: "Guru Produktif TKJ", unitDepartemen: "Jurusan TKJ",
      keperluan: "Praktikum Jaringan Komputer Semester Ganjil", tanggalDibutuhkan: "2024-11-10",
      prioritas: "tinggi", status: "selesai",
      catatanPemesan: "Segera dibutuhkan untuk praktikum", catatanAdmin: "Sudah disetujui dan diserahkan",
      userId: "u1", createdAt: new Date("2024-11-01T08:00:00Z"), updatedAt: new Date("2024-11-08T10:00:00Z"),
      barangList: { create: [
        { id: "b1", namaBarang: "Kabel UTP Cat6", jumlah: 5, satuan: "Roll", keterangan: "Untuk lab jaringan" },
        { id: "b2", namaBarang: "RJ45 Connector", jumlah: 200, satuan: "Pcs", keterangan: "Konektor jaringan" },
        { id: "b3", namaBarang: "Crimping Tool", jumlah: 10, satuan: "Buah", keterangan: "Alat crimping" },
      ]},
    },
  });

  await prisma.pemesanan.create({
    data: {
      id: "p2", nomorPesanan: "PES/2024/002", tanggalPesan: "2024-11-05",
      namaPemesan: "Siti Rahayu", jabatan: "Guru Akuntansi", unitDepartemen: "Jurusan AKL",
      keperluan: "Ujian Praktik Akuntansi", tanggalDibutuhkan: "2024-11-15",
      prioritas: "sedang", status: "diproses",
      catatanPemesan: "Untuk keperluan ujian praktek akhir semester",
      userId: "u2", createdAt: new Date("2024-11-05T09:00:00Z"), updatedAt: new Date("2024-11-06T14:00:00Z"),
      barangList: { create: [
        { id: "b4", namaBarang: "Kertas A4 80gr", jumlah: 10, satuan: "Rim", keterangan: "Untuk soal ujian" },
        { id: "b5", namaBarang: "Tinta Printer Hitam", jumlah: 5, satuan: "Cartridge", keterangan: "Printer Canon" },
        { id: "b6", namaBarang: "Map Plastik", jumlah: 100, satuan: "Buah", keterangan: "Tempat lembar jawaban" },
      ]},
    },
  });

  await prisma.pemesanan.create({
    data: {
      id: "p3", nomorPesanan: "PES/2024/003", tanggalPesan: "2024-11-10",
      namaPemesan: "Ahmad Fauzi", jabatan: "Kepala Tata Usaha", unitDepartemen: "Tata Usaha",
      keperluan: "Kebutuhan Administrasi Kantor", tanggalDibutuhkan: "2024-11-20",
      prioritas: "rendah", status: "menunggu",
      userId: "u4", createdAt: new Date("2024-11-10T10:00:00Z"), updatedAt: new Date("2024-11-10T10:00:00Z"),
      barangList: { create: [
        { id: "b7", namaBarang: "Pulpen Ballpoint", jumlah: 50, satuan: "Pcs", keterangan: "Warna biru & hitam" },
        { id: "b8", namaBarang: "Buku Tulis", jumlah: 20, satuan: "Buah", keterangan: "Buku agenda" },
        { id: "b9", namaBarang: "Staples No.10", jumlah: 10, satuan: "Kotak" },
      ]},
    },
  });

  await prisma.pemesanan.create({
    data: {
      id: "p4", nomorPesanan: "PES/2024/004", tanggalPesan: "2024-11-12",
      namaPemesan: "Dewi Lestari", jabatan: "Koordinator Lab IPA", unitDepartemen: "Lab IPA",
      keperluan: "Praktikum Kimia Kelas XI", tanggalDibutuhkan: "2024-11-25",
      prioritas: "tinggi", status: "revisi",
      catatanPemesan: "Mohon segera diproses untuk jadwal praktikum",
      catatanAdmin: "Mohon lampirkan surat persetujuan kepala lab",
      createdAt: new Date("2024-11-12T10:00:00Z"), updatedAt: new Date("2024-11-13T09:00:00Z"),
      barangList: { create: [
        { id: "b10", namaBarang: "Tabung Reaksi", jumlah: 30, satuan: "Buah", keterangan: "Kaca borosilikat" },
        { id: "b11", namaBarang: "Alkohol 70%", jumlah: 5, satuan: "Liter" },
      ]},
    },
  });

  await prisma.pemesanan.create({
    data: {
      id: "p5", nomorPesanan: "PES/2024/005", tanggalPesan: "2024-11-14",
      namaPemesan: "Eko Prasetyo", jabatan: "Guru Olahraga", unitDepartemen: "Kesiswaan",
      keperluan: "Perlengkapan Ekstrakurikuler Futsal", tanggalDibutuhkan: "2024-12-01",
      prioritas: "rendah", status: "ditolak",
      catatanAdmin: "Anggaran tidak tersedia untuk periode ini",
      createdAt: new Date("2024-11-14T11:00:00Z"), updatedAt: new Date("2024-11-15T10:00:00Z"),
      barangList: { create: [
        { id: "b12", namaBarang: "Bola Futsal", jumlah: 3, satuan: "Buah" },
        { id: "b13", namaBarang: "Rompi Tim", jumlah: 20, satuan: "Buah", keterangan: "Ukuran M dan L" },
      ]},
    },
  });

  await prisma.pengadaan.createMany({
    data: [
      { id: "pg1", nomorPengadaan: "PGD/2024/001", tanggalPengadaan: "2024-10-15", namaPengaju: "Drs. H. Sutrisno, M.Pd", jabatan: "Kepala Sekolah", unitDepartemen: "Pimpinan", jenisBarang: "Peralatan Elektronik", spesifikasi: "Laptop Intel Core i7, RAM 16GB, SSD 512GB, Layar 14\"", jumlah: 10, satuan: "Unit", estimasiHarga: 85000000, tujuanPengadaan: "Menunjang kegiatan belajar mengajar di laboratorium komputer", sumberDana: "Dana BOS", prioritas: "tinggi", status: "disetujui", catatanPengaju: "Laptop lama sudah tidak layak digunakan", catatanAdmin: "Disetujui, proses pengadaan berjalan", userId: "u3", createdAt: new Date("2024-10-15T08:00:00Z"), updatedAt: new Date("2024-10-20T09:00:00Z") },
      { id: "pg2", nomorPengadaan: "PGD/2024/002", tanggalPengadaan: "2024-10-28", namaPengaju: "Wati Kusuma, S.Pd", jabatan: "Waka Sarana Prasarana", unitDepartemen: "Sarana Prasarana", jenisBarang: "Furnitur & Perlengkapan", spesifikasi: "Meja belajar kayu jati ukuran 60x40cm dengan laci, warna coklat", jumlah: 30, satuan: "Buah", estimasiHarga: 45000000, tujuanPengadaan: "Mengganti meja belajar yang rusak di kelas X", sumberDana: "Dana Komite", prioritas: "sedang", status: "diproses", catatanPengaju: "Meja kelas X mayoritas sudah rusak dan tidak layak", createdAt: new Date("2024-10-28T09:00:00Z"), updatedAt: new Date("2024-10-30T11:00:00Z") },
      { id: "pg3", nomorPengadaan: "PGD/2024/003", tanggalPengadaan: "2024-11-02", namaPengaju: "Rino Prabowo, S.T", jabatan: "Ketua Jurusan RPL", unitDepartemen: "Jurusan RPL", jenisBarang: "Software & Lisensi", spesifikasi: "Lisensi Adobe Creative Cloud untuk 20 akun, berlangganan 1 tahun", jumlah: 20, satuan: "Lisensi", estimasiHarga: 36000000, tujuanPengadaan: "Mendukung pembelajaran desain grafis dan multimedia jurusan RPL", sumberDana: "Dana BOS", prioritas: "sedang", status: "menunggu", catatanPengaju: "Diperlukan untuk kurikulum baru jurusan RPL", createdAt: new Date("2024-11-02T10:00:00Z"), updatedAt: new Date("2024-11-02T10:00:00Z") },
      { id: "pg4", nomorPengadaan: "PGD/2024/004", tanggalPengadaan: "2024-11-08", namaPengaju: "Hendra Wijaya, S.Pd", jabatan: "Ketua Jurusan TKJ", unitDepartemen: "Jurusan TKJ", jenisBarang: "Peralatan Lab / Praktik", spesifikasi: "Switch 24 Port Gigabit Managed, Cisco Catalyst 2960", jumlah: 3, satuan: "Unit", estimasiHarga: 25000000, tujuanPengadaan: "Upgrade infrastruktur jaringan lab TKJ untuk praktikum CCNA", sumberDana: "Dana BOS", prioritas: "tinggi", status: "menunggu", catatanPengaju: "Switch lama hanya 10/100Mbps, tidak mendukung praktikum modern", createdAt: new Date("2024-11-08T09:00:00Z"), updatedAt: new Date("2024-11-08T09:00:00Z") },
      { id: "pg5", nomorPengadaan: "PGD/2024/005", tanggalPengadaan: "2024-11-10", namaPengaju: "Sri Mulyani, S.Pd", jabatan: "Kepala Perpustakaan", unitDepartemen: "Perpustakaan", jenisBarang: "Buku & Referensi", spesifikasi: "Buku teks pelajaran kurikulum Merdeka kelas X, XI, XII semua jurusan", jumlah: 500, satuan: "Eksemplar", estimasiHarga: 18000000, tujuanPengadaan: "Melengkapi koleksi perpustakaan sesuai kurikulum Merdeka", sumberDana: "Dana BOS", prioritas: "sedang", status: "ditolak", catatanAdmin: "Anggaran BOS periode ini sudah habis, ajukan kembali tahun depan", createdAt: new Date("2024-11-10T10:00:00Z"), updatedAt: new Date("2024-11-12T14:00:00Z") },
    ],
  });

  await prisma.notifikasi.createMany({
    data: [
      { id: "n1", judul: "Pengadaan Laptop Disetujui", pesan: "Pengajuan pengadaan 10 unit laptop (PGD/2024/001) telah disetujui oleh Kepala Sekolah.", tipe: "sukses", targetRole: "pemohon", nomorReferensi: "PGD/2024/001", jenisForm: "pengadaan", sudahDibaca: true, createdAt: new Date("2024-10-20T09:00:00Z") },
      { id: "n2", judul: "Permintaan Baru Masuk", pesan: "Terdapat permintaan pemesanan baru dari Ahmad Fauzi (Tata Usaha) dengan nomor PES/2024/003 menunggu persetujuan Anda.", tipe: "info", targetRole: "admin", nomorReferensi: "PES/2024/003", jenisForm: "pemesanan", sudahDibaca: false, createdAt: new Date("2024-11-10T10:00:00Z") },
      { id: "n3", judul: "Pemesanan Diproses", pesan: "Permintaan pemesanan Anda (PES/2024/002) sedang diproses oleh tim pengadaan. Estimasi selesai 2-3 hari kerja.", tipe: "info", targetRole: "pemohon", nomorReferensi: "PES/2024/002", jenisForm: "pemesanan", sudahDibaca: false, createdAt: new Date("2024-11-06T14:00:00Z") },
      { id: "n4", judul: "Pengadaan Buku Ditolak", pesan: "Pengajuan pengadaan buku (PGD/2024/005) ditolak karena anggaran BOS periode ini sudah habis.", tipe: "ditolak", targetRole: "pemohon", nomorReferensi: "PGD/2024/005", jenisForm: "pengadaan", sudahDibaca: false, createdAt: new Date("2024-11-12T14:00:00Z") },
      { id: "n5", judul: "Permintaan Perlu Revisi", pesan: "Permintaan pemesanan Dewi Lestari (PES/2024/004) memerlukan revisi. Mohon lampirkan surat persetujuan kepala lab.", tipe: "peringatan", targetRole: "pemohon", nomorReferensi: "PES/2024/004", jenisForm: "pemesanan", sudahDibaca: false, createdAt: new Date("2024-11-13T09:00:00Z") },
      { id: "n6", judul: "Stok Barang Hampir Habis", pesan: "Stok Spidol Whiteboard tersisa 8 buah (di bawah batas minimum 20 buah). Segera lakukan pengadaan.", tipe: "peringatan", targetRole: "admin", sudahDibaca: false, createdAt: new Date("2024-11-14T08:00:00Z") },
      { id: "n7", judul: "Pengadaan Baru Menunggu Persetujuan", pesan: "Terdapat 2 pengajuan pengadaan baru dari Jurusan TKJ dan Sarana Prasarana yang menunggu persetujuan Anda.", tipe: "info", targetRole: "admin", sudahDibaca: false, createdAt: new Date("2024-11-08T09:30:00Z") },
      { id: "n8", judul: "Pemesanan Selesai", pesan: "Pemesanan barang praktikum jaringan Anda (PES/2024/001) telah selesai diproses dan barang sudah diserahkan.", tipe: "sukses", targetRole: "pemohon", nomorReferensi: "PES/2024/001", jenisForm: "pemesanan", sudahDibaca: true, createdAt: new Date("2024-11-08T10:00:00Z") },
    ],
  });

  await prisma.approvalStep.createMany({
    data: [
      { id: "a1", nomorReferensi: "PES/2024/001", jenisForm: "pemesanan", langkah: 1, status: "disetujui", namaApprover: "Waka Sarana Prasarana", jabatanApprover: "Wati Kusuma, S.Pd", catatan: "Disetujui, segera proses", tanggal: new Date("2024-11-02T09:00:00Z"), pemesananId: "p1" },
      { id: "a2", nomorReferensi: "PES/2024/001", jenisForm: "pemesanan", langkah: 2, status: "disetujui", namaApprover: "Kepala Tata Usaha", jabatanApprover: "Ahmad Fauzi", catatan: "OK", tanggal: new Date("2024-11-03T10:00:00Z"), pemesananId: "p1" },
      { id: "a3", nomorReferensi: "PGD/2024/001", jenisForm: "pengadaan", langkah: 1, status: "disetujui", namaApprover: "Waka Sarana Prasarana", jabatanApprover: "Wati Kusuma, S.Pd", catatan: "Disetujui sesuai kebutuhan", tanggal: new Date("2024-10-17T10:00:00Z"), pengadaanId: "pg1" },
      { id: "a4", nomorReferensi: "PGD/2024/001", jenisForm: "pengadaan", langkah: 2, status: "disetujui", namaApprover: "Bendahara Sekolah", jabatanApprover: "Drs. Bambang, M.Pd", catatan: "Anggaran tersedia", tanggal: new Date("2024-10-18T09:00:00Z"), pengadaanId: "pg1" },
      { id: "a5", nomorReferensi: "PGD/2024/001", jenisForm: "pengadaan", langkah: 3, status: "disetujui", namaApprover: "Kepala Sekolah", jabatanApprover: "Drs. H. Sutrisno, M.Pd", catatan: "Disetujui, segera proses pengadaan", tanggal: new Date("2024-10-20T09:00:00Z"), pengadaanId: "pg1" },
      { id: "a6", nomorReferensi: "PES/2024/004", jenisForm: "pemesanan", langkah: 1, status: "revisi", namaApprover: "Waka Sarana Prasarana", jabatanApprover: "Wati Kusuma, S.Pd", catatan: "Mohon lampirkan surat persetujuan kepala lab", tanggal: new Date("2024-11-13T09:00:00Z"), pemesananId: "p4" },
      { id: "a7", nomorReferensi: "PGD/2024/005", jenisForm: "pengadaan", langkah: 1, status: "ditolak", namaApprover: "Bendahara Sekolah", jabatanApprover: "Drs. Bambang, M.Pd", catatan: "Anggaran BOS sudah habis untuk periode ini", tanggal: new Date("2024-11-12T14:00:00Z"), pengadaanId: "pg5" },
    ],
  });

  console.log("✅ Seed selesai!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
