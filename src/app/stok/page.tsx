"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/lib/appState";
import { useAuth } from "@/lib/auth";
import { formatRupiah } from "@/lib/data";
import { KatalogBarang } from "@/types";
import Link from "next/link";
import ItemImage from "@/components/ItemImage";
import {
  Package, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Coins,
  BarChart3, X, ArrowDownCircle, PlusCircle,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

type FilterStok = "semua" | "tersedia" | "menipis" | "habis";
type SortBy = "nama" | "stok_asc" | "stok_desc" | "harga_asc" | "harga_desc";

const keteranganOptions = [
  "Pemakaian rutin",
  "Kegiatan sekolah",
  "Rusak / tidak layak",
  "Hilang",
  "Distribusi ke unit",
  "Lainnya",
];

export default function StokPage() {
  const { katalogList, updateKatalogStok, updateKatalogItem, tambahKatalogItem } = useAppState();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStok, setFilterStok] = useState<FilterStok>("semua");
  const [sortBy, setSortBy] = useState<SortBy>("nama");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stokData, setStokData] = useState<KatalogBarang[]>([]);

  useEffect(() => { setStokData([...katalogList]); }, [katalogList]);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<"masuk" | "keluar">("masuk");

  // ─── Modal Pengeluaran Stok ───────────────────────────────────────────────
  const [showModalKeluar, setShowModalKeluar] = useState(false);
  const [keluarBarangId, setKeluarBarangId] = useState("");
  const [keluarJumlah, setKeluarJumlah] = useState<number>(1);
  const [keluarKeterangan, setKeluarKeterangan] = useState("Pemakaian rutin");
  const [keluarKetLainnya, setKeluarKetLainnya] = useState("");
  const [keluarError, setKeluarError] = useState("");
  const [keluarSuccess, setKeluarSuccess] = useState("");

  // ─── Modal Tambah Barang ──────────────────────────────────────────────────
  const [showModalTambah, setShowModalTambah] = useState(false);
  const [tambahLoading, setTambahLoading] = useState(false);
  const [tambahError, setTambahError] = useState("");
  const [tambahSuccess, setTambahSuccess] = useState("");
  const [tambahForm, setTambahForm] = useState({
    namaBarang: "", kategori: "", stok: 0, satuan: "",
    hargaSatuan: 0, deskripsi: "", minStok: 0,
    gambarEmoji: "📦", gambarUrl: "",
  });

  const resetTambahForm = () => {
    setTambahForm({ namaBarang: "", kategori: "", stok: 0, satuan: "", hargaSatuan: 0, deskripsi: "", minStok: 0, gambarEmoji: "📦", gambarUrl: "" });
    setTambahError(""); setTambahSuccess("");
  };

  const handleTambahBarang = async () => {
    if (!tambahForm.namaBarang.trim()) { setTambahError("Nama barang wajib diisi."); return; }
    if (!tambahForm.kategori.trim()) { setTambahError("Kategori wajib diisi."); return; }
    if (!tambahForm.satuan.trim()) { setTambahError("Satuan wajib diisi."); return; }
    if (tambahForm.hargaSatuan <= 0) { setTambahError("Harga satuan harus lebih dari 0."); return; }
    if (tambahForm.minStok < 0) { setTambahError("Stok minimum tidak boleh negatif."); return; }
    setTambahLoading(true); setTambahError("");
    try {
      await tambahKatalogItem({
        namaBarang: tambahForm.namaBarang.trim(),
        kategori: tambahForm.kategori.trim(),
        stok: tambahForm.stok,
        satuan: tambahForm.satuan.trim(),
        hargaSatuan: tambahForm.hargaSatuan,
        deskripsi: tambahForm.deskripsi.trim(),
        minStok: tambahForm.minStok,
        gambarEmoji: tambahForm.gambarEmoji || "📦",
        gambarUrl: tambahForm.gambarUrl.trim() || undefined,
      });
      setTambahSuccess(`Barang "${tambahForm.namaBarang}" berhasil ditambahkan.`);
      resetTambahForm();
    } catch {
      setTambahError("Gagal menyimpan. Coba lagi.");
    } finally {
      setTambahLoading(false);
    }
  };

  const openModalKeluar = () => {
    setKeluarBarangId("");
    setKeluarJumlah(1);
    setKeluarKeterangan("Pemakaian rutin");
    setKeluarKetLainnya("");
    setKeluarError("");
    setKeluarSuccess("");
    setShowModalKeluar(true);
  };

  const handleKeluarStok = () => {
    const barang = stokData.find((b) => b.id === keluarBarangId);
    if (!barang) { setKeluarError("Pilih barang terlebih dahulu."); return; }
    if (keluarJumlah <= 0) { setKeluarError("Jumlah harus lebih dari 0."); return; }
    if (keluarJumlah > barang.stok) { setKeluarError(`Stok ${barang.namaBarang} hanya ${barang.stok} ${barang.satuan}.`); return; }
    const stokBaru = Math.max(0, barang.stok - keluarJumlah);
    setStokData((prev) => prev.map((b) => b.id === barang.id ? { ...b, stok: stokBaru } : b));
    updateKatalogStok(barang.id, stokBaru);
    setKeluarError("");
    setKeluarSuccess(`Stok ${barang.namaBarang} berhasil dikurangi ${keluarJumlah} ${barang.satuan}.`);
    setKeluarBarangId("");
    setKeluarJumlah(1);
    setKeluarKeterangan("Pemakaian rutin");
    setKeluarKetLainnya("");
  };

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
    const stokBaru = adjustType === "masuk" ? barang.stok + adjustAmount : Math.max(0, barang.stok - adjustAmount);
    setStokData((prev) => prev.map((b) => (b.id === barang.id ? { ...b, stok: stokBaru } : b)));
    updateKatalogStok(barang.id, stokBaru);
    setEditingId(null);
    setAdjustAmount(0);
  };

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin", "admin_it"]}>
      <main className="w-full px-8 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-[#003580]">Manajemen Stok Barang</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openModalKeluar}
                className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-red-700 transition shadow"
              >
                Catat Pengeluaran
              </button>
              <Link href="/pengadaan" className="bg-[#FFD700] text-[#003580] font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-yellow-400 transition shadow">
                Ajukan Pengadaan
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
                Terdapat <span className="font-bold">{summary.itemPerluRestock} item</span> yang stoknya di bawah batas minimum
                Segera lakukan pengadaan untuk menghindari kekosongan barang
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
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${filterStok === f ? "bg-[#003580] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabel Stok */}
          <div className={user?.role === "admin" ? "lg:col-span-2" : "lg:col-span-3"}>
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
                              <ItemImage namaBarang={barang.namaBarang} kategori={barang.kategori} gambarUrl={barang.gambarUrl} gambarEmoji={barang.gambarEmoji} size={36} />
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
                              {stok.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-semibold text-[#003580]">
                            {formatRupiah(barang.stok * barang.hargaSatuan)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center gap-2 flex-wrap justify-center">
                                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                                  <button
                                    onClick={() => setAdjustType("masuk")}
                                    className={`px-3 py-1.5 transition ${adjustType === "masuk" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                                  >
                                    Masuk
                                  </button>
                                  <button
                                    onClick={() => setAdjustType("keluar")}
                                    className={`px-3 py-1.5 border-l border-gray-200 transition ${adjustType === "keluar" ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                                  >
                                    Keluar
                                  </button>
                                </div>
                                <input
                                  type="number"
                                  min={1}
                                  value={adjustAmount || ""}
                                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                                  placeholder="Jumlah"
                                  className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                                <button
                                  onClick={() => handleAdjustStok(barang)}
                                  className="text-xs bg-[#003580] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-900 transition"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setAdjustAmount(0); }}
                                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition"
                                >
                                  Batal
                                </button>
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

          {/* Sidebar: Ringkasan per Kategori — hanya Admin TU */}
          {user?.role === "admin" && (
            <div className="space-y-6">
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
          )}
        </div>
      </main>

      {/* ─── Modal Pengeluaran Stok ─────────────────────────────────────── */}
      {showModalKeluar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <ArrowDownCircle size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">Catat Pengeluaran Stok</h2>
                  <p className="text-red-100 text-xs">Kurangi stok barang dari inventaris</p>
                </div>
              </div>
              <button
                onClick={() => setShowModalKeluar(false)}
                className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="px-6 py-5 space-y-4">
              {/* Pesan Sukses */}
              {keluarSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 font-medium">{keluarSuccess}</p>
                </div>
              )}

              {/* Pilih Barang */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Pilih Barang <span className="text-red-500">*</span>
                </label>
                <select
                  value={keluarBarangId}
                  onChange={(e) => { setKeluarBarangId(e.target.value); setKeluarError(""); setKeluarSuccess(""); }}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                >
                  <option value="">-- Pilih barang --</option>
                  {stokData
                    .slice()
                    .sort((a, b) => a.namaBarang.localeCompare(b.namaBarang))
                    .map((b) => (
                      <option key={b.id} value={b.id} disabled={b.stok === 0}>
                        {b.namaBarang} — Stok: {b.stok} {b.satuan}{b.stok === 0 ? " (Habis)" : ""}
                      </option>
                    ))}
                </select>

                {/* Preview stok barang terpilih */}
                {keluarBarangId && (() => {
                  const b = stokData.find((x) => x.id === keluarBarangId);
                  if (!b) return null;
                  const stokLabel = b.stok === 0 ? { color: "text-red-600", bg: "bg-red-50", label: "Habis" }
                    : b.stok <= b.minStok ? { color: "text-orange-600", bg: "bg-orange-50", label: "Menipis" }
                      : { color: "text-green-600", bg: "bg-green-50", label: "Tersedia" };
                  return (
                    <div className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 ${stokLabel.bg} border border-gray-100`}>
                      <span className="text-xs text-gray-600">Stok saat ini</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${stokLabel.color}`}>{b.stok} {b.satuan}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${stokLabel.bg} ${stokLabel.color} border`}>{stokLabel.label}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Jumlah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Jumlah Keluar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={stokData.find((b) => b.id === keluarBarangId)?.stok ?? 9999}
                  value={keluarJumlah || ""}
                  onChange={(e) => { setKeluarJumlah(parseInt(e.target.value) || 0); setKeluarError(""); setKeluarSuccess(""); }}
                  placeholder="Masukkan jumlah"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan</label>
                <select
                  value={keluarKeterangan}
                  onChange={(e) => { setKeluarKeterangan(e.target.value); setKeluarError(""); setKeluarSuccess(""); }}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                >
                  {keteranganOptions.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {keluarKeterangan === "Lainnya" && (
                  <input
                    type="text"
                    value={keluarKetLainnya}
                    onChange={(e) => setKeluarKetLainnya(e.target.value)}
                    placeholder="Tuliskan keterangan..."
                    className="w-full mt-2 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                )}
              </div>

              {/* Error */}
              {keluarError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <XCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{keluarError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowModalKeluar(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                onClick={handleKeluarStok}
                className="flex-1 bg-red-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                Simpan Pengeluaran
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Modal Tambah Barang ────────────────────────────────────────── */}
      {showModalTambah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <PlusCircle size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">Tambah Barang Baru</h2>
                  <p className="text-green-100 text-xs">Tambah master data barang ke inventaris</p>
                </div>
              </div>
              <button onClick={() => setShowModalTambah(false)} className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {tambahSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 font-medium">{tambahSuccess}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Barang <span className="text-red-500">*</span></label>
                  <input type="text" value={tambahForm.namaBarang}
                    onChange={(e) => setTambahForm((f) => ({ ...f, namaBarang: e.target.value }))}
                    placeholder="Contoh: Kertas HVS A4"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <input type="text" value={tambahForm.kategori}
                    onChange={(e) => setTambahForm((f) => ({ ...f, kategori: e.target.value }))}
                    placeholder="Contoh: ATK"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Satuan <span className="text-red-500">*</span></label>
                  <input type="text" value={tambahForm.satuan}
                    onChange={(e) => setTambahForm((f) => ({ ...f, satuan: e.target.value }))}
                    placeholder="Contoh: Rim, Pcs, Lusin"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok Awal</label>
                  <input type="number" min={0} value={tambahForm.stok || ""}
                    onChange={(e) => setTambahForm((f) => ({ ...f, stok: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok Minimum <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={tambahForm.minStok || ""}
                    onChange={(e) => setTambahForm((f) => ({ ...f, minStok: parseInt(e.target.value) || 0 }))}
                    placeholder="Batas minimum stok"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Satuan (Rp) <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={tambahForm.hargaSatuan || ""}
                    onChange={(e) => setTambahForm((f) => ({ ...f, hargaSatuan: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea rows={2} value={tambahForm.deskripsi}
                    onChange={(e) => setTambahForm((f) => ({ ...f, deskripsi: e.target.value }))}
                    placeholder="Deskripsi singkat barang..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                </div>
              </div>

              {tambahError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <XCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{tambahError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowModalTambah(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Tutup
              </button>
              <button onClick={handleTambahBarang} disabled={tambahLoading}
                className="flex-1 bg-green-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                {tambahLoading ? "Menyimpan..." : <><PlusCircle size={15} /> Simpan Barang</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}
