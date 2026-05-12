"use client";

import { useState, useRef } from "react";
import { useAppState } from "@/lib/appState";
import { formatRupiah, formatTanggal, unitDepartemenList, kategoriBarangList } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import {
  ClipboardList, Tag, FileText, CheckCircle2, BarChart3, Coins, AlertTriangle,
  XCircle, PartyPopper, Download, Printer, Calendar, Building2, Package,
  Hourglass, RefreshCw, Pencil, Circle, Archive,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

type TabType = "ringkasan" | "departemen" | "jenis" | "status" | "bulanan";

export default function LaporanPage() {
  const { permintaanList, pengadaanList, katalogList } = useAppState();
  const [tab, setTab] = useState<TabType>("ringkasan");
  const printRef = useRef<HTMLDivElement>(null);

  const totalPemesanan = permintaanList.length;
  const totalPengadaan = pengadaanList.length;
  const totalAnggaran = pengadaanList.reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDisetujui = pengadaanList.filter((p) => p.status === "disetujui").reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDitolak = pengadaanList.filter((p) => p.status === "ditolak").reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranMenunggu = pengadaanList.filter((p) => p.status === "menunggu" || p.status === "diproses").reduce((s, p) => s + p.estimasiHarga, 0);

  const allItems = [...permintaanList, ...pengadaanList];
  const statusCounts = {
    menunggu: allItems.filter((p) => p.status === "menunggu").length,
    diproses: allItems.filter((p) => p.status === "diproses").length,
    disetujui: allItems.filter((p) => p.status === "disetujui").length,
    selesai: allItems.filter((p) => p.status === "selesai").length,
    ditolak: allItems.filter((p) => p.status === "ditolak").length,
    revisi: allItems.filter((p) => p.status === "revisi").length,
  };

  const totalItems = totalPemesanan + totalPengadaan;

  const laporan = {
    perDepartemen: unitDepartemenList.map((unit) => {
      const pem = permintaanList.filter((p) => p.unitDepartemen === unit);
      const pgd = pengadaanList.filter((p) => p.unitDepartemen === unit);
      return { unit, pemesanan: pem.length, pengadaan: pgd.length, totalAnggaran: pgd.reduce((s, p) => s + p.estimasiHarga, 0) };
    }).filter((d) => d.pemesanan > 0 || d.pengadaan > 0),
    perJenis: kategoriBarangList.map((jenis) => {
      const items = pengadaanList.filter((p) => p.jenisBarang === jenis);
      return { jenis, jumlah: items.length, totalAnggaran: items.reduce((s, p) => s + p.estimasiHarga, 0) };
    }).filter((d) => d.jumlah > 0),
  };

  const sumberDanaData = Array.from(new Set(pengadaanList.map((p) => p.sumberDana))).map((sd) => {
    const items = pengadaanList.filter((p) => p.sumberDana === sd);
    return {
      sumberDana: sd,
      jumlah: items.length,
      totalAnggaran: items.reduce((s, p) => s + p.estimasiHarga, 0),
      disetujui: items.filter((p) => p.status === "disetujui").reduce((s, p) => s + p.estimasiHarga, 0),
    };
  });

  const prioritasData = (["tinggi", "sedang", "rendah"] as const).map((p) => ({
    prioritas: p,
    pemesanan: permintaanList.filter((d) => d.prioritas === p).length,
    pengadaan: pengadaanList.filter((d) => d.prioritas === p).length,
    total: permintaanList.filter((d) => d.prioritas === p).length + pengadaanList.filter((d) => d.prioritas === p).length,
  }));

  const stokMenipis = katalogList.filter((b) => b.stok > 0 && b.stok <= b.minStok).length;
  const stokHabis = katalogList.filter((b) => b.stok === 0).length;
  const nilaiInventaris = katalogList.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);

  const [showExportMenu, setShowExportMenu] = useState(false);

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][][]) => {
    const SEP = ";";
    const escape = (v: string | number) => {
      const s = String(v);
      return s.includes(SEP) || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const bom = "\uFEFF";
    const hint = `sep=${SEP}\r\n`;
    const csv = [headers.map(escape).join(SEP), ...rows.map((r) => r.flat().map(escape).join(SEP))].join("\r\n");
    const blob = new Blob([bom + hint + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportRingkasan = () => {
    downloadCSV("ringkasan_laporan", ["Indikator", "Nilai"], [
      [["Total Pemesanan", totalPemesanan]],
      [["Total Pengadaan", totalPengadaan]],
      [["Total Pengajuan", totalItems]],
      [["Menunggu", statusCounts.menunggu]],
      [["Diproses", statusCounts.diproses]],
      [["Disetujui", statusCounts.disetujui]],
      [["Selesai", statusCounts.selesai]],
      [["Ditolak", statusCounts.ditolak]],
      [["Revisi", statusCounts.revisi]],
      [["Total Estimasi Anggaran (Rp)", totalAnggaran]],
      [["Anggaran Disetujui (Rp)", anggaranDisetujui]],
      [["Anggaran Menunggu (Rp)", anggaranMenunggu]],
      [["Anggaran Ditolak (Rp)", anggaranDitolak]],
      [["Nilai Inventaris (Rp)", nilaiInventaris]],
      [["Stok Menipis", stokMenipis]],
      [["Stok Habis", stokHabis]],
    ]);
  };

  const exportDepartemen = () => {
    downloadCSV(
      "laporan_per_departemen",
      ["Unit / Departemen", "Pemesanan", "Pengadaan", "Total Pengajuan", "Total Anggaran (Rp)", "% Anggaran"],
      laporan.perDepartemen.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d) => [[
        d.unit, d.pemesanan, d.pengadaan, d.pemesanan + d.pengadaan, d.totalAnggaran,
        totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) + "%" : "0%",
      ]])
    );
  };

  const exportJenis = () => {
    downloadCSV(
      "laporan_per_jenis_barang",
      ["Jenis / Kategori Barang", "Jumlah Pengadaan", "Total Anggaran (Rp)", "% Anggaran"],
      laporan.perJenis.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d) => [[
        d.jenis, d.jumlah, d.totalAnggaran,
        totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) + "%" : "0%",
      ]])
    );
  };

  const exportPemesanan = () => {
    downloadCSV(
      "data_pemesanan",
      ["Nomor Pesanan", "Tanggal", "Nama Pemesan", "Unit / Departemen", "Keperluan", "Prioritas", "Status", "Catatan Admin"],
      permintaanList.map((p) => [[
        p.nomorPesanan,
        formatTanggal(p.tanggalPesan),
        p.namaPemesan,
        p.unitDepartemen,
        p.keperluan,
        p.prioritas,
        p.status,
        p.catatanAdmin ?? "",
      ]])
    );
  };

  const exportPengadaan = () => {
    downloadCSV(
      "data_pengadaan",
      ["Nomor Pengadaan", "Tanggal", "Nama Pengaju", "Unit / Departemen", "Jenis Barang", "Spesifikasi", "Jumlah", "Satuan", "Estimasi Harga (Rp)", "Sumber Dana", "Tujuan", "Prioritas", "Status", "Catatan Admin"],
      pengadaanList.map((p) => [[
        p.nomorPengadaan,
        formatTanggal(p.tanggalPengadaan),
        p.namaPengaju,
        p.unitDepartemen,
        p.jenisBarang,
        p.spesifikasi,
        p.jumlah,
        p.satuan,
        p.estimasiHarga,
        p.sumberDana,
        p.tujuanPengadaan,
        p.prioritas,
        p.status,
        p.catatanAdmin ?? "",
      ]])
    );
  };

  const exportInventaris = () => {
    downloadCSV(
      "inventaris_stok",
      ["Nama Barang", "Kategori", "Stok", "Min Stok", "Satuan", "Harga Satuan (Rp)", "Nilai Total (Rp)", "Kondisi Stok"],
      katalogList.map((b) => [[
        b.namaBarang,
        b.kategori,
        b.stok,
        b.minStok,
        b.satuan,
        b.hargaSatuan,
        b.stok * b.hargaSatuan,
        b.stok === 0 ? "Habis" : b.stok <= b.minStok ? "Menipis" : "Normal",
      ]])
    );
  };

  const handlePrint = () => { window.print(); };

  const prioritasColor = (p: string) =>
    p === "tinggi" ? "text-red-600 bg-red-50 border-red-200" : p === "sedang" ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-green-600 bg-green-50 border-green-200";

  const statusBarColor: Record<string, string> = {
    menunggu: "bg-yellow-400", diproses: "bg-blue-400", disetujui: "bg-green-400",
    selesai: "bg-gray-400", ditolak: "bg-red-400", revisi: "bg-orange-400",
  };

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin", "admin_it"]}>
      <main className="max-w-7xl mx-auto px-4 py-10" ref={printRef}>
        {/* Header */}
        <div className="mb-6 screen-only">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-[#003580]">Beranda</a>
            <span>/</span>
            <span className="text-[#003580] font-semibold">Laporan</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#003580]">Laporan & Rekap Data</h1>
              <p className="text-gray-500 text-sm mt-1">Ringkasan lengkap data pemesanan, pengadaan, dan stok barang SMK Dua Mei.</p>
            </div>
            <div className="flex items-center gap-2 print:hidden shrink-0">
              {/* Export Excel Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold shadow hover:bg-green-700 transition"
                >
                  <Download size={15} /> Export Excel
                </button>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Pilih Data</p>
                      </div>
                      {[
                        { label: "Ringkasan Statistik", fn: exportRingkasan, color: "bg-blue-50 text-blue-600", icon: <BarChart3 size={15} /> },
                        { label: "Per Departemen", fn: exportDepartemen, color: "bg-indigo-50 text-indigo-600", icon: <Building2 size={15} /> },
                        { label: "Per Jenis Barang", fn: exportJenis, color: "bg-purple-50 text-purple-600", icon: <Package size={15} /> },
                        { label: "Data Pemesanan", fn: exportPemesanan, color: "bg-cyan-50 text-cyan-600", icon: <ClipboardList size={15} /> },
                        { label: "Data Pengadaan", fn: exportPengadaan, color: "bg-yellow-50 text-yellow-600", icon: <Tag size={15} /> },
                        { label: "Inventaris & Stok", fn: exportInventaris, color: "bg-green-50 text-green-600", icon: <Archive size={15} /> },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={opt.fn}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-50 last:border-0 group"
                        >
                          <span className={`w-7 h-7 rounded-lg ${opt.color} flex items-center justify-center shrink-0`}>
                            {opt.icon}
                          </span>
                          <span className="text-sm text-gray-700 font-medium group-hover:text-green-700 transition">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Cetak */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#003580] text-white text-sm font-bold shadow hover:bg-blue-900 transition"
              >
                <Printer size={15} /> Cetak Laporan
              </button>
            </div>
          </div>
        </div>

        {/* ── SCREEN-ONLY: tabs + content ── */}
        <div className="screen-only">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${tab === t.key
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
                  {Array.from(new Set(katalogList.map((b) => b.kategori))).map((kat) => {
                    const items = katalogList.filter((b) => b.kategori === kat);
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
                      {permintaanList.map((p) => (
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
                      {pengadaanList.map((p) => (
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
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sd.totalAnggaran > 0 && sd.disetujui / sd.totalAnggaran >= 0.5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
                  {[...pengadaanList].sort((a, b) => b.estimasiHarga - a.estimasiHarga).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${i === 0 ? "bg-yellow-400 text-yellow-800" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-200 text-orange-700" : "bg-gray-100 text-gray-500"
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
        </div>{/* end screen-only */}

        {/* ── PRINT-ONLY LAYOUT ── */}
        <div id="laporan-print" className="print-only" style={{ fontFamily: "'Times New Roman', serif", color: "#000" }}>

          {/* Kop Surat */}
          <div style={{ borderBottom: "3px solid #003580", paddingBottom: "10px", marginBottom: "14px" }}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td style={{ width: "80px", border: "none", verticalAlign: "middle", padding: "0" }}>
                    <div style={{ width: "70px", height: "70px", border: "2px solid #003580", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "#003580", color: "white", fontWeight: "900", fontSize: "18px", textAlign: "center", lineHeight: "1.1" }}>
                      SMK<br />DM
                    </div>
                  </td>
                  <td style={{ border: "none", verticalAlign: "middle", paddingLeft: "14px" }}>
                    <div style={{ fontSize: "18pt", fontWeight: "900", color: "#003580", letterSpacing: "0.5px" }}>SMK DUA MEI</div>
                    <div style={{ fontSize: "10pt", fontWeight: "600", color: "#333", marginTop: "2px" }}>Yayasan Pendidikan Dua Mei</div>
                    <div style={{ fontSize: "8.5pt", color: "#555", marginTop: "1px" }}>Jl. Raya Dua Mei No. 1, Ciputat Timur, Tangerang Selatan 15412</div>
                    <div style={{ fontSize: "8.5pt", color: "#555" }}>Telp: (021) 7490-xxxx &nbsp;|&nbsp; Email: smkduamei@edu.id &nbsp;|&nbsp; NPSN: xxxxxxxx</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Judul Laporan */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "13pt", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
              Laporan Rekap Pemesanan &amp; Pengadaan Barang
            </div>
            <div style={{ fontSize: "10pt", color: "#444", marginTop: "3px" }}>
              Sistem Pengadaan Internal — SMK Dua Mei
            </div>
            <div style={{ fontSize: "9pt", color: "#666", marginTop: "2px" }}>
              Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* A. Ringkasan Statistik */}
          <div style={{ marginBottom: "16px" }} className="print-section">
            <div style={{ fontWeight: "700", fontSize: "10pt", background: "#003580", color: "white", padding: "4px 10px", marginBottom: "6px" }} className="print-section-header">
              A. RINGKASAN STATISTIK
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>No</th>
                  <th style={{ textAlign: "left" }}>Indikator</th>
                  <th style={{ width: "20%", textAlign: "center" }}>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Total Pemesanan Barang", totalPemesanan],
                  ["Total Pengajuan Pengadaan", totalPengadaan],
                  ["Total Seluruh Pengajuan", totalItems],
                  ["Menunggu Persetujuan", statusCounts.menunggu],
                  ["Sedang Diproses", statusCounts.diproses],
                  ["Disetujui", statusCounts.disetujui],
                  ["Selesai", statusCounts.selesai],
                  ["Ditolak", statusCounts.ditolak],
                  ["Total Estimasi Anggaran", formatRupiah(totalAnggaran)],
                  ["Anggaran Disetujui", formatRupiah(anggaranDisetujui)],
                  ["Anggaran Ditolak", formatRupiah(anggaranDitolak)],
                  ["Nilai Inventaris Stok", formatRupiah(nilaiInventaris)],
                ].map(([label, val], i) => (
                  <tr key={String(label)}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>{label}</td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* B. Rekap Per Departemen */}
          <div style={{ marginBottom: "16px" }} className="print-section">
            <div style={{ fontWeight: "700", fontSize: "10pt", background: "#003580", color: "white", padding: "4px 10px", marginBottom: "6px" }} className="print-section-header">
              B. REKAP PER UNIT / DEPARTEMEN
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>No</th>
                  <th style={{ textAlign: "left" }}>Unit / Departemen</th>
                  <th style={{ width: "12%", textAlign: "center" }}>Pemesanan</th>
                  <th style={{ width: "12%", textAlign: "center" }}>Pengadaan</th>
                  <th style={{ width: "12%", textAlign: "center" }}>Total</th>
                  <th style={{ width: "22%", textAlign: "right" }}>Total Anggaran</th>
                </tr>
              </thead>
              <tbody>
                {laporan.perDepartemen.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d, i) => (
                  <tr key={d.unit}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>{d.unit}</td>
                    <td style={{ textAlign: "center" }}>{d.pemesanan}</td>
                    <td style={{ textAlign: "center" }}>{d.pengadaan}</td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>{d.pemesanan + d.pengadaan}</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(d.totalAnggaran)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: "700", background: "#e8edf5" }}>
                  <td colSpan={2} style={{ textAlign: "right" }}>TOTAL</td>
                  <td style={{ textAlign: "center" }}>{laporan.perDepartemen.reduce((s, d) => s + d.pemesanan, 0)}</td>
                  <td style={{ textAlign: "center" }}>{laporan.perDepartemen.reduce((s, d) => s + d.pengadaan, 0)}</td>
                  <td style={{ textAlign: "center" }}>{laporan.perDepartemen.reduce((s, d) => s + d.pemesanan + d.pengadaan, 0)}</td>
                  <td style={{ textAlign: "right" }}>{formatRupiah(totalAnggaran)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* C. Rekap Per Jenis Barang */}
          <div style={{ marginBottom: "16px" }} className="print-section">
            <div style={{ fontWeight: "700", fontSize: "10pt", background: "#003580", color: "white", padding: "4px 10px", marginBottom: "6px" }} className="print-section-header">
              C. REKAP PER JENIS / KATEGORI BARANG
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>No</th>
                  <th style={{ textAlign: "left" }}>Jenis / Kategori Barang</th>
                  <th style={{ width: "18%", textAlign: "center" }}>Jumlah Pengajuan</th>
                  <th style={{ width: "25%", textAlign: "right" }}>Total Anggaran</th>
                  <th style={{ width: "12%", textAlign: "center" }}>% Anggaran</th>
                </tr>
              </thead>
              <tbody>
                {laporan.perJenis.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d, i) => (
                  <tr key={d.jenis}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>{d.jenis}</td>
                    <td style={{ textAlign: "center" }}>{d.jumlah}</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(d.totalAnggaran)}</td>
                    <td style={{ textAlign: "center" }}>{totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* D. Data Pengadaan Lengkap */}
          <div style={{ marginBottom: "16px" }} className="print-section">
            <div style={{ fontWeight: "700", fontSize: "10pt", background: "#003580", color: "white", padding: "4px 10px", marginBottom: "6px" }} className="print-section-header">
              D. DAFTAR PENGAJUAN PENGADAAN BARANG
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>No</th>
                  <th style={{ width: "14%", textAlign: "left" }}>Nomor</th>
                  <th style={{ textAlign: "left" }}>Jenis Barang</th>
                  <th style={{ width: "16%", textAlign: "left" }}>Unit</th>
                  <th style={{ width: "18%", textAlign: "right" }}>Estimasi Harga</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pengadaanList.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "8pt" }}>{p.nomorPengadaan}</td>
                    <td>{p.jenisBarang}</td>
                    <td style={{ fontSize: "8pt" }}>{p.unitDepartemen}</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(p.estimasiHarga)}</td>
                    <td style={{ textAlign: "center", textTransform: "capitalize" }}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan */}
          <div style={{ marginTop: "32px" }} className="print-signature">
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td style={{ border: "none", width: "33%", textAlign: "center", verticalAlign: "top", padding: "0 8px" }}>
                    <div style={{ fontSize: "9pt" }}>Dibuat oleh,</div>
                    <div style={{ marginTop: "55px", borderTop: "1px solid #000", paddingTop: "4px", fontSize: "9pt", fontWeight: "600" }}>
                      Staff Tata Usaha
                    </div>
                    <div style={{ fontSize: "8pt", color: "#555" }}>NIP: —</div>
                  </td>
                  <td style={{ border: "none", width: "33%", textAlign: "center", verticalAlign: "top", padding: "0 8px" }}>
                    <div style={{ fontSize: "9pt" }}>Mengetahui,</div>
                    <div style={{ marginTop: "55px", borderTop: "1px solid #000", paddingTop: "4px", fontSize: "9pt", fontWeight: "600" }}>
                      Wakil Kepala Sarana Prasarana
                    </div>
                    <div style={{ fontSize: "8pt", color: "#555" }}>NIP: —</div>
                  </td>
                  <td style={{ border: "none", width: "34%", textAlign: "center", verticalAlign: "top", padding: "0 8px" }}>
                    <div style={{ fontSize: "9pt" }}>
                      Ciputat, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                    </div>
                    <div style={{ fontSize: "9pt", marginTop: "2px" }}>Kepala Sekolah,</div>
                    <div style={{ marginTop: "48px", borderTop: "1px solid #000", paddingTop: "4px", fontSize: "9pt", fontWeight: "600" }}>
                      Drs. H. Ahmad Fauzi
                    </div>
                    <div style={{ fontSize: "8pt", color: "#555" }}>NIP: —</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Cetak */}
          <div style={{ marginTop: "24px", borderTop: "1px solid #ccc", paddingTop: "6px", textAlign: "center", fontSize: "7.5pt", color: "#888" }}>
            Dokumen ini dicetak secara otomatis oleh Sistem Pengadaan Internal SMK Dua Mei •{" "}
            {new Date().toLocaleString("id-ID")} • Dokumen ini sah tanpa tanda tangan basah jika dicetak dari sistem resmi.
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
