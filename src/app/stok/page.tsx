"use client";

import { useState } from "react";
import { katalogBarang, formatRupiah } from "@/lib/data";
import { KatalogBarang } from "@/types";
import Link from "next/link";
import { ItemIcon } from "@/components/Icons";
import {
  Package, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Coins,
  ClipboardList, BarChart3, Siren,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

type FilterStok = "semua" | "tersedia" | "menipis" | "habis";
type SortBy = "nama" | "stok_asc" | "stok_desc" | "harga_asc" | "harga_desc";

export default function StokPage() {
  const [search, setSearch] = useState("");
  const [filterStok, setFilterStok] = useState<FilterStok>("semua");
  const [sortBy, setSortBy] = useState<SortBy>("nama");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stokData, setStokData] = useState<KatalogBarang[]>([...katalogBarang]);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<"masuk" | "keluar">("masuk");
  const [riwayatStok, setRiwayatStok] = useState<
    { id: string; namaBarang: string; tipe: "masuk" | "keluar"; jumlah: number; stokSebelum: number; stokSesudah: number; tanggal: string }[]
  >([
    { id: "h1", namaBarang: "Kertas A4 80gr", tipe: "masuk", jumlah: 20, stokSebelum: 25, stokSesudah: 45, tanggal: "2024-11-10T08:00:00Z" },
    { id: "h2", namaBarang: "Spidol Whiteboard", tipe: "keluar", jumlah: 12, stokSebelum: 20, stokSesudah: 8, tanggal: "2024-11-09T14:00:00Z" },
    { id: "h3", namaBarang: "Pulpen Ballpoint", tipe: "masuk", jumlah: 50, stokSebelum: 70, stokSesudah: 120, tanggal: "2024-11-08T10:00:00Z" },
    { id: "h4", namaBarang: "Sabun Cuci Tangan", tipe: "keluar", jumlah: 20, stokSebelum: 20, stokSesudah: 0, tanggal: "2024-11-07T09:00:00Z" },
    { id: "h5", namaBarang: "Kursi Belajar", tipe: "keluar", jumlah: 5, stokSebelum: 5, stokSesudah: 0, tanggal: "2024-11-06T11:00:00Z" },
    { id: "h6", namaBarang: "Mouse Wireless", tipe: "masuk", jumlah: 10, stokSebelum: 15, stokSesudah: 25, tanggal: "2024-11-05T08:30:00Z" },
  ]);

  const kategoriList = ["Semua", ...Array.from(new Set(stokData.map((b) => b.kategori)))];

  const stokLabel = (b: KatalogBarang) => {
    if (b.stok === 0) return { label: "Habis", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" };
    if (b.stok <= b.minStok) return { label: "Menipis", color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-500" };
    return { label: "Tersedia", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" };
  };

  const filtered = stokData
    .filter((b) => {
      const matchSearch = !search || b.namaBarang.toLowerCase().includes(search.toLowerCase());
      const matchKat = kategoriFilter === "Semua" || b.kategori === kategoriFilter;
      const matchStok =
        filterStok === "semua" ||
        (filterStok === "tersedia" && b.stok > b.minStok) ||
        (filterStok === "menipis" && b.stok > 0 && b.stok <= b.minStok) ||
        (filterStok === "habis" && b.stok === 0);
      return matchSearch && matchKat && matchStok;
    })
    .sort((a, b) => {
      if (sortBy === "nama") return a.namaBarang.localeCompare(b.namaBarang);
      if (sortBy === "stok_asc") return a.stok - b.stok;
      if (sortBy === "stok_desc") return b.stok - a.stok;
      if (sortBy === "harga_asc") return a.hargaSatuan - b.hargaSatuan;
      if (sortBy === "harga_desc") return b.hargaSatuan - a.hargaSatuan;
      return 0;
    });

  const summary = {
    total: stokData.length,
    tersedia: stokData.filter((b) => b.stok > b.minStok).length,
    menipis: stokData.filter((b) => b.stok > 0 && b.stok <= b.minStok).length,
    habis: stokData.filter((b) => b.stok === 0).length,
    nilaiTotal: stokData.reduce((sum, b) => sum + b.stok * b.hargaSatuan, 0),
    itemPerluRestock: stokData.filter((b) => b.stok <= b.minStok).length,
  };

  const handleAdjustStok = (barang: KatalogBarang) => {
    if (adjustAmount <= 0) return;
    const stokSebelum = barang.stok;
    const stokBaru = adjustType === "masuk" ? barang.stok + adjustAmount : Math.max(0, barang.stok - adjustAmount);

    setStokData((prev) =>
      prev.map((b) => (b.id === barang.id ? { ...b, stok: stokBaru } : b))
    );

    setRiwayatStok((prev) => [
      {
        id: `h${Date.now()}`,
        namaBarang: barang.namaBarang,
        tipe: adjustType,
        jumlah: adjustAmount,
        stokSebelum,
        stokSesudah: stokBaru,
        tanggal: new Date().toISOString(),
      },
      ...prev,
    ]);

    setEditingId(null);
    setAdjustAmount(0);
  };

  const formatTanggalPendek = (tanggal: string) =>
    new Date(tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin"]}>
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-[#003580]">Beranda</a>
          <span>/</span>
          <span className="text-[#003580] font-semibold">Manajemen Stok</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#003580]">Manajemen Stok Barang</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola dan pantau stok barang gudang SMK Dua Mei secara real-time.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/katalog" className="bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <Package size={16} /> Katalog Barang
            </Link>
            <Link href="/pengadaan" className="bg-[#FFD700] text-[#003580] font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-yellow-400 transition shadow">
              + Ajukan Pengadaan
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total Jenis Barang", value: summary.total, icon: <Package size={22} />, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Stok Tersedia", value: summary.tersedia, icon: <CheckCircle2 size={22} />, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Stok Menipis", value: summary.menipis, icon: <AlertTriangle size={22} />, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Stok Habis", value: summary.habis, icon: <XCircle size={22} />, color: "text-red-600", bg: "bg-red-50 border-red-200" },
          { label: "Perlu Restock", value: summary.itemPerluRestock, icon: <RefreshCw size={22} />, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
          { label: "Nilai Inventaris", value: formatRupiah(summary.nilaiTotal), icon: <Coins size={22} />, color: "text-[#003580]", bg: "bg-blue-50 border-blue-200", isText: true },
        ].map((card) => (
          <div key={card.label} className={`border rounded-xl p-3 text-center ${card.bg}`}>
            <div className={`flex justify-center mb-1 ${card.color}`}>{card.icon}</div>
            <p className={`text-lg font-extrabold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Alert for low stock */}
      {summary.itemPerluRestock > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={24} className="text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-orange-800">Peringatan Stok Rendah</p>
            <p className="text-xs text-orange-700 mt-0.5">
              Terdapat <span className="font-bold">{summary.itemPerluRestock} item</span> yang stoknya di bawah batas minimum.
              Segera lakukan pengadaan untuk menghindari kekosongan barang.
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {stokData.filter((b) => b.stok <= b.minStok).map((b) => (
                <span key={b.id} className="text-xs bg-white border border-orange-300 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  {b.namaBarang}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={kategoriFilter}
          onChange={(e) => setKategoriFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {kategoriList.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="nama">Urutkan: Nama</option>
          <option value="stok_asc">Stok: Terkecil</option>
          <option value="stok_desc">Stok: Terbanyak</option>
          <option value="harga_asc">Harga: Termurah</option>
          <option value="harga_desc">Harga: Termahal</option>
        </select>
        <div className="flex gap-2 flex-wrap">
          {(["semua", "tersedia", "menipis", "habis"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStok(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                filterStok === f ? "bg-[#003580] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Stok */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">Barang</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 text-center">Stok</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 text-center">Min</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 text-right">Nilai</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((barang) => {
                    const stok = stokLabel(barang);
                    const isEditing = editingId === barang.id;
                    return (
                      <tr key={barang.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-500"><ItemIcon name={barang.gambarEmoji} size={20} /></span>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{barang.namaBarang}</p>
                              <p className="text-xs text-gray-400">{barang.kategori}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${stok.color}`}>{barang.stok}</span>
                          <span className="text-xs text-gray-400 ml-1">{barang.satuan}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">{barang.minStok}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${stok.bg} ${stok.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stok.dot}`} />
                            {stok.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-[#003580]">
                          {formatRupiah(barang.stok * barang.hargaSatuan)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 items-center min-w-[160px]">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setAdjustType("masuk")}
                                  className={`text-xs px-2 py-1 rounded font-medium transition ${
                                    adjustType === "masuk" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  + Masuk
                                </button>
                                <button
                                  onClick={() => setAdjustType("keluar")}
                                  className={`text-xs px-2 py-1 rounded font-medium transition ${
                                    adjustType === "keluar" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  - Keluar
                                </button>
                              </div>
                              <input
                                type="number"
                                min={1}
                                value={adjustAmount || ""}
                                onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                                placeholder="Jumlah"
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleAdjustStok(barang)}
                                  className="text-xs bg-[#003580] text-white px-2 py-1 rounded font-medium hover:bg-blue-900 transition"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setAdjustAmount(0); }}
                                  className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium hover:bg-gray-300 transition"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(barang.id); setAdjustAmount(0); setAdjustType("masuk"); }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              Atur Stok
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="flex justify-center mb-3"><Package size={40} className="text-gray-300" /></div>
                <p className="text-sm">Tidak ada barang yang cocok dengan filter</p>
              </div>
            )}
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
              Menampilkan {filtered.length} dari {stokData.length} barang
            </div>
          </div>
        </div>

        {/* Sidebar: Riwayat & Stok Kritis */}
        <div className="space-y-6">
          {/* Barang Perlu Restock */}
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-red-600 flex items-center gap-2">
                <Siren size={16} /> Perlu Restock
              </h3>
              <Link href="/pengadaan" className="text-xs text-blue-500 hover:underline">Ajukan Pengadaan</Link>
            </div>
            <div className="divide-y divide-gray-50 max-h-[280px] overflow-y-auto">
              {stokData.filter((b) => b.stok <= b.minStok).length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs flex flex-col items-center gap-1">
                  <CheckCircle2 size={20} className="text-green-400" /> Semua stok aman
                </div>
              ) : (
                stokData.filter((b) => b.stok <= b.minStok).map((b) => (
                  <div key={b.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500"><ItemIcon name={b.gambarEmoji} size={18} /></span>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{b.namaBarang}</p>
                        <p className="text-xs text-gray-400">
                          Stok: <span className={b.stok === 0 ? "text-red-600 font-bold" : "text-orange-600 font-bold"}>{b.stok}</span> / Min: {b.minStok} {b.satuan}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {b.stok === 0 ? (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Habis</span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">Menipis</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Riwayat Perubahan Stok */}
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#003580] flex items-center gap-2">
                <ClipboardList size={16} /> Riwayat Perubahan Stok
              </h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
              {riwayatStok.map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-800">{r.namaBarang}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTanggalPendek(r.tanggal)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      r.tipe === "masuk" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {r.tipe === "masuk" ? "+" : "-"}{r.jumlah}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{r.stokSebelum}</span>
                    <span className="text-xs text-gray-300">→</span>
                    <span className={`text-xs font-bold ${r.stokSesudah <= 0 ? "text-red-600" : "text-gray-700"}`}>{r.stokSesudah}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stok per Kategori */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <h3 className="font-bold text-sm text-[#003580] mb-4 flex items-center gap-2">
              <BarChart3 size={16} /> Ringkasan per Kategori
            </h3>
            <div className="space-y-3">
              {Array.from(new Set(stokData.map((b) => b.kategori))).map((kat) => {
                const items = stokData.filter((b) => b.kategori === kat);
                const totalStok = items.reduce((s, b) => s + b.stok, 0);
                const totalNilai = items.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);
                return (
                  <div key={kat} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{kat}</p>
                      <span className="text-xs text-gray-400">{items.length} item</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Total stok: <span className="font-bold text-[#003580]">{totalStok}</span></p>
                      <p className="text-xs text-green-600 font-semibold">{formatRupiah(totalNilai)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
    </ProtectedPage>
  );
}
