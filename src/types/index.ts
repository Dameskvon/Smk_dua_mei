export type StatusPesanan =
  | "menunggu"
  | "diproses"
  | "disetujui"
  | "ditolak"
  | "selesai"
  | "revisi";

export type JenisForm = "pemesanan" | "pengadaan";

export interface BarangItem {
  id: string;
  namaBarang: string;
  jumlah: number;
  satuan: string;
  keterangan?: string;
  hargaSatuan?: number;
}

export interface FormPemesanan {
  id: string;
  nomorPesanan: string;
  tanggalPesan: string;
  namaPemesan: string;
  jabatan: string;
  unitDepartemen: string;
  keperluan: string;
  tanggalDibutuhkan: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  barangList: BarangItem[];
  status: StatusPesanan;
  catatanPemesan?: string;
  catatanAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormPengadaan {
  id: string;
  nomorPengadaan: string;
  tanggalPengadaan: string;
  namaPengaju: string;
  jabatan: string;
  unitDepartemen: string;
  jenisBarang: string;
  spesifikasi: string;
  jumlah: number;
  satuan: string;
  estimasiHarga: number;
  tujuanPengadaan: string;
  sumberDana: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  status: StatusPesanan;
  dokumenPendukung?: string;
  catatanPengaju?: string;
  catatanAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPemesanan: number;
  totalPengadaan: number;
  menungguPersetujuan: number;
  diproses: number;
  selesai: number;
  ditolak: number;
}

export interface KatalogBarang {
  id: string;
  namaBarang: string;
  kategori: string;
  stok: number;
  satuan: string;
  hargaSatuan: number;
  deskripsi: string;
  minStok: number;
  gambarEmoji: string;
}

export interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  tipe: "info" | "sukses" | "peringatan" | "ditolak";
  targetRole: "pemohon" | "admin" | "kepala_sekolah" | "semua";
  nomorReferensi?: string;
  jenisForm?: JenisForm;
  sudahDibaca: boolean;
  createdAt: string;
}

export interface ApprovalStep {
  id: string;
  nomorReferensi: string;
  jenisForm: JenisForm;
  langkah: number;
  status: "menunggu" | "disetujui" | "ditolak" | "revisi";
  namaApprover: string;
  jabatanApprover: string;
  catatan?: string;
  tanggal: string;
}
