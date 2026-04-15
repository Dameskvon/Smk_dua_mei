import { dataPemesanan, dataPengadaan, getDashboardStats, formatRupiah, formatTanggal } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import {
  IconClipboard, IconTag, IconHourglass, IconRefresh, IconPencil,
  IconCheckCircle, IconPackage, IconShieldCheck, IconBell, IconStore,
} from "@/components/Icons";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const total = stats.totalPemesanan + stats.totalPengadaan;

  // estimasiHarga sudah merupakan total anggaran (bukan per satuan)
  const totalAnggaran = dataPengadaan.reduce((sum, p) => sum + p.estimasiHarga, 0);
  const anggaranDisetujui = dataPengadaan
    .filter((p) => p.status === "disetujui")
    .reduce((sum, p) => sum + p.estimasiHarga, 0);

  const statCards = [
    { label: "Total Pemesanan", value: stats.totalPemesanan, icon: <IconClipboard size={20} />, color: "bg-blue-500", sub: "Permintaan masuk" },
    { label: "Total Pengadaan", value: stats.totalPengadaan, icon: <IconTag size={20} />, color: "bg-yellow-500", sub: "Pengajuan masuk" },
    { label: "Menunggu Proses", value: stats.menungguPersetujuan, icon: <IconHourglass size={20} />, color: "bg-orange-500", sub: "Perlu tindakan" },
    { label: "Sedang Diproses", value: stats.diproses, icon: <IconRefresh size={20} />, color: "bg-indigo-500", sub: "Dalam proses" },
    { label: "Perlu Revisi", value: stats.revisi, icon: <IconPencil size={20} />, color: "bg-orange-400", sub: "Butuh perbaikan" },
    { label: "Selesai / Disetujui", value: stats.selesai, icon: <IconCheckCircle size={20} />, color: "bg-green-500", sub: "Berhasil" },
  ];

  const recentPemesanan = [...dataPemesanan]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentPengadaan = [...dataPengadaan]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusDistribusi = [
    { label: "Menunggu", count: stats.menungguPersetujuan, color: "bg-yellow-400" },
    { label: "Diproses", count: stats.diproses, color: "bg-blue-400" },
    { label: "Perlu Revisi", count: stats.revisi, color: "bg-orange-400" },
    { label: "Selesai/Disetujui", count: stats.selesai, color: "bg-green-400" },
    { label: "Ditolak", count: stats.ditolak, color: "bg-red-400" },
  ].map((s) => ({ ...s, pct: total > 0 ? Math.round((s.count / total) * 100) : 0 }));

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin"]}>
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <a href="/" className="hover:text-[#003580]">Beranda</a>
              <span>/</span>
              <span className="text-[#003580] font-semibold">Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#003580]">Dashboard Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Ringkasan dan statistik pemesanan serta pengadaan barang SMK Dua Mei.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/pemesanan" className="bg-[#003580] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-900 transition shadow">
              + Pemesanan
            </Link>
            <Link href="/pengadaan" className="bg-[#FFD700] text-[#003580] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition shadow">
              + Pengadaan
            </Link>
            <Link href="/laporan" className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition shadow">
              Laporan
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow border border-gray-100 p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${card.color} text-white mb-2`}>
                {card.icon}
              </div>
              <p className="text-2xl font-extrabold text-[#003580]">{card.value}</p>
              <p className="text-xs font-medium text-gray-700 leading-tight">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Anggaran Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#003580] to-[#0047AB] text-white rounded-xl shadow p-6">
            <p className="text-blue-200 text-sm mb-1">Total Estimasi Anggaran</p>
            <p className="text-3xl font-extrabold">{formatRupiah(totalAnggaran)}</p>
            <p className="text-blue-300 text-xs mt-2">{dataPengadaan.length} item pengadaan</p>
          </div>
          <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl shadow p-6">
            <p className="text-yellow-900 text-sm mb-1 font-medium">Anggaran Disetujui</p>
            <p className="text-3xl font-extrabold text-[#003580]">{formatRupiah(anggaranDisetujui)}</p>
            <p className="text-yellow-800 text-xs mt-2">{dataPengadaan.filter((p) => p.status === "disetujui").length} item disetujui</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl shadow p-6">
            <p className="text-red-100 text-sm mb-1">Anggaran Ditolak</p>
            <p className="text-3xl font-extrabold">
              {formatRupiah(dataPengadaan.filter((p) => p.status === "ditolak").reduce((s, p) => s + p.estimasiHarga, 0))}
            </p>
            <p className="text-red-200 text-xs mt-2">{dataPengadaan.filter((p) => p.status === "ditolak").length} item ditolak</p>
          </div>
        </div>

        {/* Status Distribusi */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-8">
          <h2 className="font-bold text-[#003580] text-base mb-5">Distribusi Status (Semua Pengajuan)</h2>
          <div className="space-y-3">
            {statusDistribusi.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-32 shrink-0">{s.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`${s.color} h-3 rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-20 text-right shrink-0">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pemesanan Terbaru */}
          <div className="bg-white rounded-xl shadow border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-sm">Pemesanan Terbaru</h2>
              <Link href="/riwayat" className="text-xs text-blue-500 hover:underline">Lihat Semua</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPemesanan.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-xs font-mono text-blue-600 font-bold">{item.nomorPesanan}</p>
                    <p className="text-sm font-medium text-gray-800">{item.namaPemesan}</p>
                    <p className="text-xs text-gray-400">{item.unitDepartemen} • {formatTanggal(item.tanggalPesan)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Pengadaan Terbaru */}
          <div className="bg-white rounded-xl shadow border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-sm">Pengadaan Terbaru</h2>
              <Link href="/riwayat" className="text-xs text-blue-500 hover:underline">Lihat Semua</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPengadaan.map((item) => (
                <div key={item.id} className="flex items-start justify-between px-5 py-3">
                  <div>
                    <p className="text-xs font-mono text-yellow-600 font-bold">{item.nomorPengadaan}</p>
                    <p className="text-sm font-medium text-gray-800">{item.jenisBarang}</p>
                    <p className="text-xs text-gray-400">{item.unitDepartemen} • {formatRupiah(item.estimasiHarga)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rekap Pengadaan Per Unit */}
        <div className="bg-white rounded-xl shadow border border-gray-100 mt-6 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#003580] text-base">Rekap Pengadaan per Unit</h2>
            <Link href="/laporan" className="text-xs text-blue-500 hover:underline">Laporan Lengkap →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-l-lg">Unit / Departemen</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600">Jenis Barang</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600">Estimasi Total</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataPengadaan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.unitDepartemen}</p>
                      <p className="text-xs text-gray-400">{item.namaPengaju}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{item.jenisBarang}</td>
                    <td className="px-4 py-3 font-semibold text-[#003580] text-xs">{formatRupiah(item.estimasiHarga)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links ke fitur baru */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { href: "/katalog", icon: <IconPackage size={28} className="text-blue-600" />, label: "Katalog Barang", color: "bg-blue-50 border-blue-300" },
            { href: "/approval", icon: <IconShieldCheck size={28} className="text-green-600" />, label: "Alur Persetujuan", color: "bg-green-50 border-green-300" },
            { href: "/notifikasi", icon: <IconBell size={28} className="text-yellow-600" />, label: "Notifikasi", color: "bg-yellow-50 border-yellow-300" },
            { href: "/stok", icon: <IconStore size={28} className="text-purple-600" />, label: "Manajemen Stok", color: "bg-purple-50 border-purple-300" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className={`border rounded-xl p-4 text-center hover:shadow transition ${l.color}`}>
              <div className="flex justify-center mb-2">{l.icon}</div>
              <p className="text-xs font-semibold text-gray-700">{l.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </ProtectedPage>
  );
}
