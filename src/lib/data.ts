export const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export const formatTanggal = (tanggal: string): string => {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatTanggalPendek = (tanggal: string): string => {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  menunggu: { label: "Menunggu", color: "text-yellow-700", bg: "bg-yellow-100" },
  diproses: { label: "Diproses", color: "text-blue-700", bg: "bg-blue-100" },
  disetujui: { label: "Disetujui", color: "text-green-700", bg: "bg-green-100" },
  ditolak: { label: "Ditolak", color: "text-red-700", bg: "bg-red-100" },
  selesai: { label: "Selesai", color: "text-gray-700", bg: "bg-gray-200" },
  revisi: { label: "Perlu Revisi", color: "text-orange-700", bg: "bg-orange-100" },
};

export const unitDepartemenList = [
  "Pimpinan",
  "Tata Usaha",
  "Sarana Prasarana",
  "Kurikulum",
  "Kesiswaan",
  "Humas",
  "Jurusan TKJ",
  "Jurusan RPL",
  "Jurusan AKL",
  "Jurusan OTKP",
  "Jurusan BDP",
  "Perpustakaan",
  "UKS",
  "BK",
  "Lab Komputer",
  "Lab IPA",
];

export const kategoriBarangList = [
  "Alat Tulis & Kertas",
  "Peralatan Elektronik",
  "Furnitur & Perlengkapan",
  "Peralatan Lab / Praktik",
  "Software & Lisensi",
  "Buku & Referensi",
  "Peralatan Olahraga",
  "Perlengkapan Kebersihan",
  "Peralatan Medis / UKS",
  "Lainnya",
];
