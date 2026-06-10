"use client";

import { useState, useRef, useEffect } from "react";
import { useAppState } from "@/lib/appState";
import { useAuth } from "@/lib/auth";
import { formatRupiah, formatTanggal, unitDepartemenList, kategoriBarangList } from "@/lib/data";
import { exportLaporanExcel } from "@/lib/exportExcel";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import {
  ClipboardList, Tag, FileText, CheckCircle2, BarChart3, Coins, AlertTriangle,
  XCircle, PartyPopper, Download, Printer, Calendar, Building2, Package,
  Hourglass, RefreshCw, Pencil, Circle,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

type TabType = "ringkasan" | "departemen" | "jenis" | "status" | "bulanan";

interface Signatory { nama: string; jabatan: string; }

export default function LaporanPage() {
  const { permintaanList, pengadaanList, katalogList } = useAppState();
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("ringkasan");
  const printRef = useRef<HTMLDivElement>(null);
  const [kepalaSekolah, setKepalaSekolah] = useState<Signatory | null>(null);
  const [adminUser, setAdminUser] = useState<Signatory | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("smk_user") : null;
    if (!saved) return;
    const token = Buffer.from(saved).toString("base64");
    fetch("/api/users/signatories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.kepalaSekolah) setKepalaSekolah(data.kepalaSekolah);
        if (data.adminUser) setAdminUser(data.adminUser);
      })
      .catch(() => { });
  }, []);

  const totalPemesanan = permintaanList.length;
  const totalPengadaan = pengadaanList.length;
  const totalAnggaran = pengadaanList.reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDisetujui = pengadaanList.filter((p) => p.status === "disetujui" || p.status === "selesai").reduce((s, p) => s + p.estimasiHarga, 0);
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
      disetujui: items.filter((p) => p.status === "disetujui" || p.status === "selesai").reduce((s, p) => s + p.estimasiHarga, 0),
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

  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 100));
    exportLaporanExcel(permintaanList, pengadaanList, katalogList);
    setExporting(false);
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
      <main className="w-full px-8 py-10" ref={printRef}>
        {/* Header */}
        <div className="mb-6 screen-only">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#003580]">Laporan & Rekap Data</h1>
            </div>
            <div className="flex items-center gap-2 print:hidden shrink-0">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold shadow hover:bg-green-700 transition disabled:opacity-60"
              >
                <Download size={15} />
                {exporting ? "Mengekspor..." : "Export Excel"}
              </button>
              <Link
                href="/laporan/cetak"
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#003580] text-white text-sm font-bold shadow hover:bg-blue-900 transition"
              >
                <Printer size={15} /> Cetak Laporan
              </Link>
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
                <div className="bg-linear-to-br from-[#003580] to-[#0047AB] text-white rounded-xl shadow p-5">
                  <p className="text-blue-200 text-xs mb-1">Total Estimasi Anggaran</p>
                  <p className="text-2xl font-extrabold">{formatRupiah(totalAnggaran)}</p>
                  <p className="text-blue-300 text-xs mt-1">{totalPengadaan} pengajuan</p>
                </div>
                <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl shadow p-5">
                  <p className="text-green-100 text-xs mb-1">Anggaran Disetujui</p>
                  <p className="text-2xl font-extrabold">{formatRupiah(anggaranDisetujui)}</p>
                  <p className="text-green-200 text-xs mt-1">{totalAnggaran > 0 ? Math.round((anggaranDisetujui / totalAnggaran) * 100) : 0}% dari total</p>
                </div>
                <div className="bg-linear-to-br from-orange-400 to-yellow-500 text-black rounded-xl shadow p-5">
                  <p className="text-orange-900 text-xs mb-1 font-medium">Anggaran Menunggu</p>
                  <p className="text-2xl font-extrabold">{formatRupiah(anggaranMenunggu)}</p>
                  <p className="text-orange-800 text-xs mt-1">Belum diproses</p>
                </div>
                <div className="bg-linear-to-br from-red-500 to-red-600 text-white rounded-xl shadow p-5">
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
                        <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{d.unit}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className="bg-linear-to-r from-[#003580] to-[#0047AB] h-4 rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[#003580] w-28 text-right shrink-0">{formatRupiah(d.totalAnggaran)}</span>
                        <span className="text-xs text-gray-400 w-8 text-right shrink-0">{pct}%</span>
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
                        <div className="flex gap-2">
                          {normal > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{normal} Tersedia</span>}
                          {menipis > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{menipis} Menipis</span>}
                          {habis > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{habis} Habis</span>}
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
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-xs font-bold text-green-700">{formatRupiah(sd.disetujui)}</span>
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                {sd.totalAnggaran > 0 ? Math.round((sd.disetujui / sd.totalAnggaran) * 100) : 0}%
                              </span>
                            </div>
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
                      <p className="font-bold text-lg mb-1">
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
                  <h2 className="font-bold text-[#003580] text-base">Top 5 Pengadaan Terbesar</h2>
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
          </div>
        </div>{/* end screen-only */}

        {/* ── PRINT-ONLY LAYOUT ── */}
        <div id="laporan-print" className="print-only">

          {/* Kop Surat */}
          <div style={{ borderBottom: "3px solid #003580", paddingBottom: 10, marginBottom: 14, fontFamily: "'Times New Roman', Georgia, serif" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ width: 90, verticalAlign: "middle", padding: 0, border: "none" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-smk.svg" alt="Logo SMK Dua Mei" style={{ width: 75, height: 75 }} />
                  </td>
                  <td style={{ verticalAlign: "middle", paddingLeft: 12, border: "none" }}>
                    <div style={{ fontSize: "18pt", fontWeight: 900, color: "#003580", letterSpacing: "0.5px" }}>SMK DUA MEI</div>
                    <div style={{ fontSize: "10pt", fontWeight: 700, color: "#222", marginTop: 2 }}>Yayasan Pendidikan Dua Mei</div>
                    <div style={{ fontSize: "8.5pt", color: "#555", marginTop: 1 }}>Jl. Raya Dua Mei No. 1, Ciputat Timur, Tangerang Selatan 15412</div>
                    <div style={{ fontSize: "8.5pt", color: "#555" }}>Telp: (021) 7490-xxxx &nbsp;|&nbsp; Email: smkduamei@edu.id &nbsp;|&nbsp; NPSN: xxxxxxxx</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Judul */}
          <div style={{ textAlign: "center", marginBottom: 16, fontFamily: "'Times New Roman', Georgia, serif" }}>
            <div style={{ fontSize: "13pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Laporan Rekap Pemesanan &amp; Pengadaan Barang
            </div>
            <div style={{ fontSize: "10pt", color: "#444", marginTop: 3 }}>Sistem Pengadaan Internal — SMK Dua Mei</div>
            <div style={{ fontSize: "9pt", color: "#666", marginTop: 2 }}>
              Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* ── helper styles shared across all sections ── */}
          {(() => {
            const PH = { background: "#003580", color: "#fff", padding: "5px 10px", fontSize: "10pt", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 0 } as React.CSSProperties;
            const TBL = { width: "100%", borderCollapse: "collapse" as const, marginBottom: 18, tableLayout: "auto" as const, fontFamily: "'Times New Roman', Georgia, serif", fontSize: "8.5pt" };
            const TH = (align: "left" | "center" | "right" = "left"): React.CSSProperties => ({ background: "#003580", color: "#fff", padding: "6px 8px", fontWeight: 700, border: "1px solid #444", textAlign: align, whiteSpace: "nowrap" });
            const TD = (row: number, align: "left" | "center" | "right" = "left"): React.CSSProperties => ({ background: row % 2 === 0 ? "#F0F4FA" : "#fff", padding: "4px 8px", border: "1px solid #ccc", textAlign: align, verticalAlign: "middle" });
            const TF = (align: "left" | "center" | "right" = "left"): React.CSSProperties => ({ background: "#E8EDF5", padding: "5px 8px", fontWeight: 700, color: "#003580", border: "1px solid #aaa", textAlign: align });
            const anggaranMenunggu2 = pengadaanList.filter((p) => ["menunggu", "diproses"].includes(p.status)).reduce((s, p) => s + p.estimasiHarga, 0);

            /* Per Departemen computed */
            const deptMap: Record<string, { pem: number; pgd: number; anggaran: number }> = {};
            permintaanList.forEach((p) => { if (!deptMap[p.unitDepartemen]) deptMap[p.unitDepartemen] = { pem: 0, pgd: 0, anggaran: 0 }; deptMap[p.unitDepartemen].pem++; });
            pengadaanList.forEach((p) => { if (!deptMap[p.unitDepartemen]) deptMap[p.unitDepartemen] = { pem: 0, pgd: 0, anggaran: 0 }; deptMap[p.unitDepartemen].pgd++; deptMap[p.unitDepartemen].anggaran += p.estimasiHarga; });
            const deptRows = Object.entries(deptMap).sort((a, b) => b[1].anggaran - a[1].anggaran);
            const deptTot = deptRows.reduce((s, [, d]) => ({ pem: s.pem + d.pem, pgd: s.pgd + d.pgd, anggaran: s.anggaran + d.anggaran }), { pem: 0, pgd: 0, anggaran: 0 });

            const sColor: Record<string, string> = { menunggu: "#D97706", diproses: "#2563EB", disetujui: "#16A34A", selesai: "#6B7280", ditolak: "#DC2626", revisi: "#EA580C" };

            return (
              <>
                {/* A. RINGKASAN */}
                <div style={{ marginBottom: 20 }}>
                  <div style={PH}>A. RINGKASAN STATISTIK</div>
                  <table style={TBL}>
                    <thead>
                      <tr>
                        <th style={{ ...TH("center"), width: "6%" }}>No</th>
                        <th style={TH("left")}>Indikator</th>
                        <th style={{ ...TH("center"), width: "28%" }}>Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ["Total Pemesanan Barang", permintaanList.length],
                        ["Total Pengajuan Pengadaan", pengadaanList.length],
                        ["Total Seluruh Pengajuan", totalItems],
                        null,
                        ["Menunggu Persetujuan", statusCounts.menunggu],
                        ["Sedang Diproses", statusCounts.diproses],
                        ["Disetujui", statusCounts.disetujui],
                        ["Selesai", statusCounts.selesai],
                        ["Ditolak", statusCounts.ditolak],
                        ["Revisi", statusCounts.revisi],
                        null,
                        ["Total Estimasi Anggaran", formatRupiah(totalAnggaran)],
                        ["Anggaran Disetujui", formatRupiah(anggaranDisetujui)],
                        ["Anggaran Menunggu / Diproses", formatRupiah(anggaranMenunggu2)],
                        ["Anggaran Ditolak", formatRupiah(anggaranDitolak)],
                        null,
                        ["Nilai Total Inventaris Stok", formatRupiah(nilaiInventaris)],
                        ["Jumlah Item Stok Menipis", stokMenipis],
                        ["Jumlah Item Stok Habis", stokHabis],
                      ] as ([string, string | number] | null)[]).map((row, i) =>
                        row === null ? (
                          <tr key={i}><td colSpan={3} style={{ border: "1px solid #ccc", padding: 3, background: "#f8f9fa" }}></td></tr>
                        ) : (
                          <tr key={i}>
                            <td style={TD(i, "center")}>{i + 1}</td>
                            <td style={TD(i, "left")}>{row[0]}</td>
                            <td style={{ ...TD(i, "center"), fontWeight: 700 }}>{row[1]}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* B. PER DEPARTEMEN */}
                <div style={{ marginBottom: 20 }}>
                  <div style={PH}>B. REKAP PER UNIT / DEPARTEMEN</div>
                  <table style={TBL}>
                    <thead>
                      <tr>
                        <th style={{ ...TH("center"), width: "5%" }}>No</th>
                        <th style={TH("left")}>Unit / Departemen</th>
                        <th style={{ ...TH("center"), width: "13%" }}>Pemesanan</th>
                        <th style={{ ...TH("center"), width: "13%" }}>Pengadaan</th>
                        <th style={{ ...TH("center"), width: "13%" }}>Total</th>
                        <th style={{ ...TH("right"), width: "22%" }}>Total Anggaran</th>
                        <th style={{ ...TH("center"), width: "10%" }}>% Anggaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptRows.map(([unit, d], i) => (
                        <tr key={unit}>
                          <td style={TD(i, "center")}>{i + 1}</td>
                          <td style={TD(i, "left")}>{unit}</td>
                          <td style={TD(i, "center")}>{d.pem}</td>
                          <td style={TD(i, "center")}>{d.pgd}</td>
                          <td style={{ ...TD(i, "center"), fontWeight: 700 }}>{d.pem + d.pgd}</td>
                          <td style={TD(i, "right")}>{formatRupiah(d.anggaran)}</td>
                          <td style={TD(i, "center")}>{totalAnggaran > 0 ? Math.round((d.anggaran / totalAnggaran) * 100) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={TF("right")}>TOTAL</td>
                        <td style={TF("center")}>{deptTot.pem}</td>
                        <td style={TF("center")}>{deptTot.pgd}</td>
                        <td style={TF("center")}>{deptTot.pem + deptTot.pgd}</td>
                        <td style={TF("right")}>{formatRupiah(deptTot.anggaran)}</td>
                        <td style={TF("center")}>100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* C. PER JENIS */}
                <div style={{ marginBottom: 20 }}>
                  <div style={PH}>C. REKAP PER JENIS / KATEGORI BARANG</div>
                  <table style={TBL}>
                    <thead>
                      <tr>
                        <th style={{ ...TH("center"), width: "5%" }}>No</th>
                        <th style={TH("left")}>Jenis / Kategori Barang</th>
                        <th style={{ ...TH("center"), width: "18%" }}>Jumlah Pengajuan</th>
                        <th style={{ ...TH("right"), width: "25%" }}>Total Anggaran</th>
                        <th style={{ ...TH("center"), width: "12%" }}>% Anggaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporan.perJenis.sort((a, b) => b.totalAnggaran - a.totalAnggaran).map((d, i) => (
                        <tr key={d.jenis}>
                          <td style={TD(i, "center")}>{i + 1}</td>
                          <td style={TD(i, "left")}>{d.jenis}</td>
                          <td style={TD(i, "center")}>{d.jumlah}</td>
                          <td style={TD(i, "right")}>{formatRupiah(d.totalAnggaran)}</td>
                          <td style={TD(i, "center")}>{totalAnggaran > 0 ? Math.round((d.totalAnggaran / totalAnggaran) * 100) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={TF("right")}>TOTAL</td>
                        <td style={TF("center")}>{laporan.perJenis.reduce((s, d) => s + d.jumlah, 0)}</td>
                        <td style={TF("right")}>{formatRupiah(totalAnggaran)}</td>
                        <td style={TF("center")}>100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* D. PENGADAAN */}
                <div style={{ marginBottom: 20, breakBefore: "page" as const }}>
                  <div style={PH}>D. DAFTAR PENGAJUAN PENGADAAN BARANG</div>
                  <table style={TBL}>
                    <thead>
                      <tr>
                        <th style={{ ...TH("center"), width: "4%" }}>No</th>
                        <th style={{ ...TH("left"), width: "14%" }}>Nomor Pengadaan</th>
                        <th style={{ ...TH("left"), width: "12%" }}>Tanggal</th>
                        <th style={TH("left")}>Nama Pengaju</th>
                        <th style={TH("left")}>Unit / Departemen</th>
                        <th style={TH("left")}>Jenis Barang</th>
                        <th style={{ ...TH("center"), width: "5%" }}>Jml</th>
                        <th style={{ ...TH("center"), width: "7%" }}>Satuan</th>
                        <th style={{ ...TH("right"), width: "14%" }}>Estimasi Harga</th>
                        <th style={{ ...TH("center"), width: "9%" }}>Prioritas</th>
                        <th style={{ ...TH("center"), width: "9%" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengadaanList.map((p, i) => (
                        <tr key={p.id}>
                          <td style={TD(i, "center")}>{i + 1}</td>
                          <td style={{ ...TD(i, "left"), fontFamily: "monospace", fontSize: "7.5pt", color: "#92400E" }}>{p.nomorPengadaan}</td>
                          <td style={{ ...TD(i, "center"), fontSize: "7.5pt" }}>{formatTanggal(p.tanggalPengadaan)}</td>
                          <td style={TD(i, "left")}>{p.namaPengaju}</td>
                          <td style={{ ...TD(i, "left"), fontSize: "7.5pt" }}>{p.unitDepartemen}</td>
                          <td style={TD(i, "left")}>{p.jenisBarang}</td>
                          <td style={TD(i, "center")}>{p.jumlah}</td>
                          <td style={TD(i, "center")}>{p.satuan}</td>
                          <td style={TD(i, "right")}>{formatRupiah(p.estimasiHarga)}</td>
                          <td style={{ ...TD(i, "center"), fontSize: "7.5pt", textTransform: "capitalize" }}>{p.prioritas}</td>
                          <td style={{ ...TD(i, "center"), fontWeight: 700, color: sColor[p.status] ?? "#111", fontSize: "7.5pt", textTransform: "capitalize" }}>{p.status}</td>
                        </tr>
                      ))}
                      {pengadaanList.length === 0 && (
                        <tr><td colSpan={11} style={{ ...TD(0, "center"), fontStyle: "italic", color: "#888" }}>Tidak ada data pengadaan</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={8} style={TF("right")}>TOTAL ANGGARAN</td>
                        <td style={TF("right")}>{formatRupiah(totalAnggaran)}</td>
                        <td colSpan={2} style={TF()}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* E. PEMESANAN */}
                <div style={{ marginBottom: 20 }}>
                  <div style={PH}>E. DAFTAR PERMINTAAN PEMESANAN BARANG</div>
                  <table style={TBL}>
                    <thead>
                      <tr>
                        <th style={{ ...TH("center"), width: "4%" }}>No</th>
                        <th style={{ ...TH("left"), width: "15%" }}>Nomor Pesanan</th>
                        <th style={{ ...TH("left"), width: "12%" }}>Tanggal</th>
                        <th style={TH("left")}>Nama Pemesan</th>
                        <th style={TH("left")}>Unit / Departemen</th>
                        <th style={{ ...TH("left"), width: "18%" }}>Keperluan</th>
                        <th style={{ ...TH("center"), width: "9%" }}>Prioritas</th>
                        <th style={{ ...TH("center"), width: "9%" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permintaanList.map((p, i) => (
                        <tr key={p.id}>
                          <td style={TD(i, "center")}>{i + 1}</td>
                          <td style={{ ...TD(i, "left"), fontFamily: "monospace", fontSize: "7.5pt", color: "#1D4ED8" }}>{p.nomorPesanan}</td>
                          <td style={{ ...TD(i, "center"), fontSize: "7.5pt" }}>{formatTanggal(p.tanggalPesan)}</td>
                          <td style={TD(i, "left")}>{p.namaPemesan}</td>
                          <td style={{ ...TD(i, "left"), fontSize: "7.5pt" }}>{p.unitDepartemen}</td>
                          <td style={{ ...TD(i, "left"), fontSize: "7.5pt" }}>{p.keperluan}</td>
                          <td style={{ ...TD(i, "center"), fontSize: "7.5pt", textTransform: "capitalize" }}>{p.prioritas}</td>
                          <td style={{ ...TD(i, "center"), fontWeight: 700, color: sColor[p.status] ?? "#111", fontSize: "7.5pt", textTransform: "capitalize" }}>{p.status}</td>
                        </tr>
                      ))}
                      {permintaanList.length === 0 && (
                        <tr><td colSpan={8} style={{ ...TD(0, "center"), fontStyle: "italic", color: "#888" }}>Tidak ada data pemesanan</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* F. INVENTARIS */}
                <div style={{ marginBottom: 20, breakBefore: "page" as const }}>
                  <div style={PH}>F. REKAP INVENTARIS &amp; STOK BARANG</div>
                  <table style={TBL}>
                    <thead>
                      <tr>
                        <th style={{ ...TH("center"), width: "4%" }}>No</th>
                        <th style={TH("left")}>Nama Barang</th>
                        <th style={{ ...TH("left"), width: "16%" }}>Kategori</th>
                        <th style={{ ...TH("center"), width: "7%" }}>Stok</th>
                        <th style={{ ...TH("center"), width: "8%" }}>Min Stok</th>
                        <th style={{ ...TH("center"), width: "7%" }}>Satuan</th>
                        <th style={{ ...TH("right"), width: "15%" }}>Harga Satuan</th>
                        <th style={{ ...TH("right"), width: "15%" }}>Nilai Total</th>
                        <th style={{ ...TH("center"), width: "9%" }}>Kondisi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {katalogList.map((b, i) => {
                        const kondisi = b.stok === 0 ? "Habis" : b.stok <= b.minStok ? "Menipis" : "Normal";
                        const kColor = kondisi === "Habis" ? "#DC2626" : kondisi === "Menipis" ? "#D97706" : "#16A34A";
                        return (
                          <tr key={b.id}>
                            <td style={TD(i, "center")}>{i + 1}</td>
                            <td style={TD(i, "left")}>{b.namaBarang}</td>
                            <td style={{ ...TD(i, "left"), fontSize: "7.5pt" }}>{b.kategori}</td>
                            <td style={{ ...TD(i, "center"), fontWeight: b.stok <= b.minStok ? 700 : 400, color: b.stok === 0 ? "#DC2626" : "#111" }}>{b.stok}</td>
                            <td style={TD(i, "center")}>{b.minStok}</td>
                            <td style={TD(i, "center")}>{b.satuan}</td>
                            <td style={{ ...TD(i, "right"), fontSize: "7.5pt" }}>{formatRupiah(b.hargaSatuan)}</td>
                            <td style={{ ...TD(i, "right"), fontSize: "7.5pt" }}>{formatRupiah(b.stok * b.hargaSatuan)}</td>
                            <td style={{ ...TD(i, "center"), fontWeight: 700, color: kColor, fontSize: "8pt" }}>{kondisi}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} style={TF("right")}>TOTAL NILAI INVENTARIS</td>
                        <td style={TF("right")}>{formatRupiah(nilaiInventaris)}</td>
                        <td style={TF()}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Tanda Tangan */}
                <div style={{ marginTop: 36, fontFamily: "'Times New Roman', Georgia, serif" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        {/* Dibuat oleh — user yang sedang login */}
                        <td style={{ border: "none", width: "33%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                          <div style={{ fontSize: "9pt" }}>Dibuat oleh,</div>
                          <div style={{ marginTop: 56, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                            {user?.nama ?? "—"}
                          </div>
                          <div style={{ fontSize: "8pt", color: "#555" }}>{user?.jabatan ?? "—"}</div>
                        </td>

                        {/* Mengetahui — admin TU dari database */}
                        <td style={{ border: "none", width: "33%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                          <div style={{ fontSize: "9pt" }}>Mengetahui,</div>
                          <div style={{ marginTop: 56, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                            {adminUser?.nama ?? "—"}
                          </div>
                          <div style={{ fontSize: "8pt", color: "#555" }}>{adminUser?.jabatan ?? "Admin Tata Usaha"}</div>
                        </td>

                        {/* Kepala Sekolah — dari database */}
                        <td style={{ border: "none", width: "34%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                          <div style={{ fontSize: "9pt", marginBottom: 2 }}>
                            Ciputat, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: "9pt" }}>Kepala Sekolah,</div>
                          <div style={{ marginTop: 48, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                            {kepalaSekolah?.nama ?? "—"}
                          </div>
                          <div style={{ fontSize: "8pt", color: "#555" }}>{kepalaSekolah?.jabatan ?? "Kepala Sekolah"}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 24, borderTop: "1px solid #ccc", paddingTop: 6, textAlign: "center", fontSize: "7.5pt", color: "#888", fontFamily: "'Times New Roman', serif" }}>
                  Dokumen ini dicetak secara otomatis oleh Sistem Pengadaan Internal SMK Dua Mei &bull;{" "}
                  {new Date().toLocaleString("id-ID")} &bull; Dokumen sah tanpa tanda tangan basah jika dicetak dari sistem resmi
                </div>
              </>
            );
          })()}
        </div>
      </main>
    </ProtectedPage>
  );
}
