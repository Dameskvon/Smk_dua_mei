"use client";

import { useState, useRef } from "react";
import { dataPemesanan, dataPengadaan, katalogBarang, formatRupiah, formatTanggal, getLaporanData } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import {
  ClipboardList, Tag, FileText, CheckCircle2, BarChart3, Coins, AlertTriangle,
  XCircle, PartyPopper, Download, Printer, Calendar, Building2, Package,
  Hourglass, RefreshCw, Pencil, Circle,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

type TabType = "ringkasan" | "departemen" | "jenis" | "status" | "bulanan";

export default function LaporanPage() {
  const [tab, setTab] = useState<TabType>("ringkasan");
  const printRef = useRef<HTMLDivElement>(null);

  const laporan = getLaporanData();

  const totalPemesanan = dataPemesanan.length;
  const totalPengadaan = dataPengadaan.length;
  const totalAnggaran = dataPengadaan.reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDisetujui = dataPengadaan.filter((p) => p.status === "disetujui").reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDitolak = dataPengadaan.filter((p) => p.status === "ditolak").reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranMenunggu = dataPengadaan.filter((p) => p.status === "menunggu" || p.status === "diproses").reduce((s, p) => s + p.estimasiHarga, 0);

  const statusCounts = {
    menunggu: [...dataPemesanan, ...dataPengadaan].filter((p) => p.status === "menunggu").length,
    diproses: [...dataPemesanan, ...dataPengadaan].filter((p) => p.status === "diproses").length,
    disetujui: [...dataPemesanan, ...dataPengadaan].filter((p) => p.status === "disetujui").length,
    selesai: [...dataPemesanan, ...dataPengadaan].filter((p) => p.status === "selesai").length,
    ditolak: [...dataPemesanan, ...dataPengadaan].filter((p) => p.status === "ditolak").length,
    revisi: [...dataPemesanan, ...dataPengadaan].filter((p) => p.status === "revisi").length,
  };

  const totalItems = totalPemesanan + totalPengadaan;

  const sumberDanaData = Array.from(new Set(dataPengadaan.map((p) => p.sumberDana))).map((sd) => {
    const items = dataPengadaan.filter((p) => p.sumberDana === sd);
    return {
      sumberDana: sd,
      jumlah: items.length,
      totalAnggaran: items.reduce((s, p) => s + p.estimasiHarga, 0),
      disetujui: items.filter((p) => p.status === "disetujui").reduce((s, p) => s + p.estimasiHarga, 0),
    };
  });

  const prioritasData = (["tinggi", "sedang", "rendah"] as const).map((p) => ({
    prioritas: p,
    pemesanan: dataPemesanan.filter((d) => d.prioritas === p).length,
    pengadaan: dataPengadaan.filter((d) => d.prioritas === p).length,
    total: dataPemesanan.filter((d) => d.prioritas === p).length + dataPengadaan.filter((d) => d.prioritas === p).length,
  }));

  const stokMenipis = katalogBarang.filter((b) => b.stok > 0 && b.stok <= b.minStok).length;
  const stokHabis = katalogBarang.filter((b) => b.stok === 0).length;
  const nilaiInventaris = katalogBarang.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);

  const handleExportCSV = () => {
    const header = "Unit/Departemen,Pemesanan,Pengadaan,Total Anggaran\n";
    const rows = laporan.perDepartemen.map((d) =>
      `${d.unit},${d.pemesanan},${d.pengadaan},${d.totalAnggaran}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan_smk_dua_mei_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => { window.print(); };

  const prioritasColor = (p: string) =>
    p === "tinggi" ? "text-red-600 bg-red-50 border-red-200" : p === "sedang" ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-green-600 bg-green-50 border-green-200";

  const statusBarColor: Record<string, string> = {
    menunggu: "bg-yellow-400", diproses: "bg-blue-400", disetujui: "bg-green-400",
    selesai: "bg-gray-400", ditolak: "bg-red-400", revisi: "bg-orange-400",
  };

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin"]}>
    <main className="max-w-7xl mx-auto px-4 py-10" ref={printRef}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-[#003580]">Beranda</a>
          <span>/</span>
          <span className="text-[#003580] font-semibold">Laporan</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#003580]">Laporan & Rekap Data</h1>
            <p className="text-gray-500 text-sm mt-1">Ringkasan lengkap data pemesanan, pengadaan, dan stok barang SMK Dua Mei.</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={handleExportCSV} className="bg-green-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-green-700 transition shadow flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handlePrint} className="bg-[#003580] text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-blue-900 transition shadow flex items-center gap-2">
              <Printer size={16} /> Cetak Laporan
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto print:hidden">
        {([
          { key: "ringkasan", label: "Ringkasan", icon: <BarChart3 size={14} /> },
          { key: "departemen", label: "Per Departemen", icon: <Building2 size={14} /> },
          { key: "jenis", label: "Per Jenis Barang", icon: <Package size={14} /> },
          { key: "status", label: "Per Status", icon: <ClipboardList size={14} /> },
          { key: "bulanan", label: "Analisis", icon: <Calendar size={14} /> },
        ] as { key: TabType; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              tab === t.key
                ? "bg-[#003580] text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Ringkasan */}
      {tab === "ringkasan" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Pemesanan", value: totalPemesanan, icon: <ClipboardList size={24} />, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
              { label: "Total Pengadaan", value: totalPengadaan, icon: <Tag size={24} />, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
              { label: "Total Pengajuan", value: totalItems, icon: <FileText size={24} />, color: "text-[#003580]", bg: "bg-indigo-50 border-indigo-200" },
              { label: "Tingkat Selesai", value: `${totalItems > 0 ? Math.round(((statusCounts.selesai + statusCounts.disetujui) / totalItems) * 100) : 0}%`, icon: <CheckCircle2 size={24} />, color: "text-green-600", bg: "bg-green-50 border-green-200" },
            ].map((s) => (
              <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
                <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#003580] to-[#0047AB] text-white rounded-xl shadow p-5">
              <p className="text-blue-200 text-xs mb-1">Total Estimasi Anggaran</p>
              <p className="text-2xl font-extrabold">{formatRupiah(totalAnggaran)}</p>
              <p className="text-blue-300 text-xs mt-1">{totalPengadaan} pengajuan</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow p-5">
              <p className="text-green-100 text-xs mb-1">Anggaran Disetujui</p>
              <p className="text-2xl font-extrabold">{formatRupiah(anggaranDisetujui)}</p>
              <p className="text-green-200 text-xs mt-1">{totalAnggaran > 0 ? Math.round((anggaranDisetujui / totalAnggaran) * 100) : 0}% dari total</p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl shadow p-5">
              <p className="text-orange-900 text-xs mb-1 font-medium">Anggaran Menunggu</p>
              <p className="text-2xl font-extrabold text-[#003580]">{formatRupiah(anggaranMenunggu)}</p>
              <p className="text-orange-800 text-xs mt-1">Belum diproses</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow p-5">
              <p className="text-red-100 text-xs mb-1">Anggaran Ditolak</p>
              <p className="text-2xl font-extrabold">{formatRupiah(anggaranDitolak)}</p>
              <p className="text-red-200 text-xs mt-1">{totalAnggaran > 0 ? Math.round((anggaranDitolak / totalAnggaran) * 100) : 0}% dari total</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5">Distribusi Status Semua Pengajuan</h2>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([key, count]) => {
                const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                const labels: Record<string, string> = {
                  menunggu: "Menunggu Persetujuan", diproses: "Sedang Diproses", disetujui: "Disetujui",
                  selesai: "Selesai", ditolak: "Ditolak", revisi: "Perlu Revisi",
                };
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-40 shrink-0">{labels[key]}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={`${statusBarColor[key]} h-4 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-600 w-24 text-right shrink-0 font-medium">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow border border-gray-100 p-5 text-center">
              <div className="flex justify-center mb-2"><Coins size={32} className="text-[#003580]" /></div>
              <p className="text-xl font-extrabold text-[#003580]">{formatRupiah(nilaiInventaris)}</p>
              <p className="text-xs text-gray-500 mt-1">Total Nilai Inventaris</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-5 text-center">
              <div className="flex justify-center mb-2"><AlertTriangle size={32} className="text-orange-600" /></div>
              <p className="text-xl font-extrabold text-orange-600">{stokMenipis}</p>
              <p className="text-xs text-gray-500 mt-1">Item Stok Menipis</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-5 text-center">
              <div className="flex justify-center mb-2"><XCircle size={32} className="text-red-600" /></div>
              <p className="text-xl font-extrabold text-red-600">{stokHabis}</p>
              <p className="text-xs text-gray-500 mt-1">Item Stok Habis</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Per Departemen */}
      {tab === "departemen" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-[#003580] text-base">Rekap Per Unit / Departemen</h2>
              <span className="text-xs text-gray-400">{laporan.perDepartemen.length} departemen aktif</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Unit / Departemen</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-center">Pemesanan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-center">Pengadaan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-center">Total</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">Total Anggaran</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">% Anggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {laporan.perDepartemen.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d) => (
                    <tr key={d.unit} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3"><p className="font-medium text-gray-800">{d.unit}</p></td>
                      <td className="px-5 py-3 text-center"><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{d.pemesanan}</span></td>
                      <td className="px-5 py-3 text-center"><span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{d.pengadaan}</span></td>
                      <td className="px-5 py-3 text-center font-bold text-[#003580]">{d.pemesanan + d.pengadaan}</td>
                      <td className="px-5 py-3 text-right font-semibold text-[#003580] text-xs">{formatRupiah(d.totalAnggaran)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#003580] h-2 rounded-full" style={{ width: `${totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-bold">
                    <td className="px-5 py-3 text-[#003580] text-sm">TOTAL</td>
                    <td className="px-5 py-3 text-center text-blue-600">{laporan.perDepartemen.reduce((s, d) => s + d.pemesanan, 0)}</td>
                    <td className="px-5 py-3 text-center text-yellow-600">{laporan.perDepartemen.reduce((s, d) => s + d.pengadaan, 0)}</td>
                    <td className="px-5 py-3 text-center text-[#003580]">{laporan.perDepartemen.reduce((s, d) => s + d.pemesanan + d.pengadaan, 0)}</td>
                    <td className="px-5 py-3 text-right text-[#003580]">{formatRupiah(totalAnggaran)}</td>
                    <td className="px-5 py-3 text-right text-gray-500 text-xs">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5">Distribusi Anggaran per Departemen</h2>
            <div className="space-y-3">
              {laporan.perDepartemen.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d) => {
                const pct = totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0;
                return (
                  <div key={d.unit} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-36 shrink-0 truncate">{d.unit}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#003580] to-[#0047AB] h-5 rounded-full transition-all flex items-center px-2" style={{ width: `${Math.max(pct, 5)}%` }}>
                        {pct > 15 && <span className="text-white text-xs font-bold">{formatRupiah(d.totalAnggaran)}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Per Jenis Barang */}
      {tab === "jenis" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-base">Rekap Per Jenis / Kategori Barang</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Jenis / Kategori</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-center">Jumlah Pengadaan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">Total Anggaran</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">% Anggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {laporan.perJenis.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d) => (
                    <tr key={d.jenis} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-800">{d.jenis}</td>
                      <td className="px-5 py-3 text-center"><span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">{d.jumlah}</span></td>
                      <td className="px-5 py-3 text-right font-semibold text-[#003580] text-xs">{formatRupiah(d.totalAnggaran)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-50 font-bold">
                    <td className="px-5 py-3 text-[#003580]">TOTAL</td>
                    <td className="px-5 py-3 text-center text-purple-600">{laporan.perJenis.reduce((s, d) => s + d.jumlah, 0)}</td>
                    <td className="px-5 py-3 text-right text-[#003580]">{formatRupiah(totalAnggaran)}</td>
                    <td className="px-5 py-3 text-right text-gray-500 text-xs">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5">Ketersediaan Stok per Kategori</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(new Set(katalogBarang.map((b) => b.kategori))).map((kat) => {
                const items = katalogBarang.filter((b) => b.kategori === kat);
                const normal = items.filter((b) => b.stok > b.minStok).length;
                const menipis = items.filter((b) => b.stok > 0 && b.stok <= b.minStok).length;
                const habis = items.filter((b) => b.stok === 0).length;
                return (
                  <div key={kat} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">{kat}</p>
                    <div className="flex gap-2 mb-2">
                      {normal > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{normal} Tersedia</span>}
                      {menipis > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{menipis} Menipis</span>}
                      {habis > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{habis} Habis</span>}
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                      {normal > 0 && <div className="bg-green-400 h-2" style={{ width: `${(normal / items.length) * 100}%` }} />}
                      {menipis > 0 && <div className="bg-orange-400 h-2" style={{ width: `${(menipis / items.length) * 100}%` }} />}
                      {habis > 0 && <div className="bg-red-400 h-2" style={{ width: `${(habis / items.length) * 100}%` }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Per Status */}
      {tab === "status" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { status: "menunggu", label: "Menunggu", icon: <Hourglass size={24} />, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
              { status: "diproses", label: "Diproses", icon: <RefreshCw size={24} />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
              { status: "disetujui", label: "Disetujui", icon: <CheckCircle2 size={24} />, color: "text-green-700", bg: "bg-green-50 border-green-200" },
              { status: "selesai", label: "Selesai", icon: <PartyPopper size={24} />, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
              { status: "ditolak", label: "Ditolak", icon: <XCircle size={24} />, color: "text-red-700", bg: "bg-red-50 border-red-200" },
              { status: "revisi", label: "Revisi", icon: <Pencil size={24} />, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
            ].map((s) => (
              <div key={s.status} className={`border rounded-xl p-4 text-center ${s.bg}`}>
                <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{statusCounts[s.status as keyof typeof statusCounts]}</p>
                <p className="text-xs text-gray-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-base">Detail Pemesanan per Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Nomor</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Pemesan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Unit</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Tanggal</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Prioritas</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataPemesanan.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs text-blue-600 font-bold">{p.nomorPesanan}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{p.namaPemesan}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{p.unitDepartemen}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{formatTanggal(p.tanggalPesan)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${prioritasColor(p.prioritas)}`}>
                          {p.prioritas.charAt(0).toUpperCase() + p.prioritas.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-base">Detail Pengadaan per Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Nomor</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Pengaju</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Jenis Barang</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">Anggaran</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Sumber Dana</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataPengadaan.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs text-yellow-600 font-bold">{p.nomorPengadaan}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{p.namaPengaju}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{p.jenisBarang}</td>
                      <td className="px-5 py-3 text-right font-semibold text-[#003580] text-xs">{formatRupiah(p.estimasiHarga)}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{p.sumberDana}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Analisis */}
      {tab === "bulanan" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-base">Analisis Sumber Dana</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600">Sumber Dana</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-center">Jumlah Pengajuan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">Total Anggaran</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">Disetujui</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-600 text-right">% Disetujui</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sumberDanaData.map((sd) => (
                    <tr key={sd.sumberDana} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-800">{sd.sumberDana}</td>
                      <td className="px-5 py-3 text-center"><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{sd.jumlah}</span></td>
                      <td className="px-5 py-3 text-right font-semibold text-[#003580] text-xs">{formatRupiah(sd.totalAnggaran)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-green-600 text-xs">{formatRupiah(sd.disetujui)}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          sd.totalAnggaran > 0 && sd.disetujui / sd.totalAnggaran >= 0.5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {sd.totalAnggaran > 0 ? Math.round((sd.disetujui / sd.totalAnggaran) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5">Analisis per Tingkat Prioritas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prioritasData.map((p) => (
                <div key={p.prioritas} className={`border rounded-xl p-5 ${prioritasColor(p.prioritas)}`}>
                  <p className="font-bold text-lg mb-1 flex items-center gap-2">
                    <Circle size={12} className={p.prioritas === "tinggi" ? "fill-red-500 text-red-500" : p.prioritas === "sedang" ? "fill-yellow-500 text-yellow-500" : "fill-green-500 text-green-500"} />
                    Prioritas {p.prioritas.charAt(0).toUpperCase() + p.prioritas.slice(1)}
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Pemesanan</span><span className="font-bold">{p.pemesanan}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Pengadaan</span><span className="font-bold">{p.pengadaan}</span></div>
                    <hr />
                    <div className="flex justify-between text-sm"><span className="text-gray-600 font-bold">Total</span><span className="font-extrabold text-[#003580]">{p.total}</span></div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${p.prioritas === "tinggi" ? "bg-red-500" : p.prioritas === "sedang" ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${totalItems > 0 ? Math.round((p.total / totalItems) * 100) : 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 text-right">{totalItems > 0 ? Math.round((p.total / totalItems) * 100) : 0}% dari total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#003580] text-base">Top 5 Pengadaan Terbesar (by Anggaran)</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {[...dataPengadaan].sort((a, b) => b.estimasiHarga - a.estimasiHarga).slice(0, 5).map((p, i) => (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    i === 0 ? "bg-yellow-400 text-yellow-800" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-200 text-orange-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{p.jenisBarang}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-gray-500">{p.unitDepartemen} — {p.namaPengaju}</p>
                  </div>
                  <p className="text-sm font-extrabold text-[#003580] shrink-0">{formatRupiah(p.estimasiHarga)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center print:hidden">
        <p className="text-xs text-gray-400">
          Laporan dibuat otomatis oleh Sistem Pengadaan SMK Dua Mei •{" "}
          {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-3 justify-center mt-3">
          <Link href="/dashboard" className="text-xs text-blue-500 hover:underline">← Dashboard</Link>
          <Link href="/riwayat" className="text-xs text-blue-500 hover:underline">Riwayat →</Link>
        </div>
      </div>
    </main>
    </ProtectedPage>
  );
}
