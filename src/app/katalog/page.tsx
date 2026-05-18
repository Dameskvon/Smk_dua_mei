"use client";

import { useState } from "react";
import { useAppState } from "@/lib/appState";
import { formatRupiah } from "@/lib/data";
import { KatalogBarang } from "@/types";
import Link from "next/link";
import ItemImage from "@/components/ItemImage";
import { Package, AlertTriangle, XCircle, X } from "lucide-react";

export default function KatalogPage() {
  const { katalogList } = useAppState();
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [filterStok, setFilterStok] = useState<"semua" | "tersedia" | "menipis" | "habis">("semua");
  const [selected, setSelected] = useState<KatalogBarang | null>(null);

  const kategoriList = ["Semua", ...Array.from(new Set(katalogList.map((b) => b.kategori)))];

  const filtered = katalogList.filter((b) => {
    const matchSearch = !search || b.namaBarang.toLowerCase().includes(search.toLowerCase()) || b.kategori.toLowerCase().includes(search.toLowerCase());
    const matchKat = kategori === "Semua" || b.kategori === kategori;
    const matchStok =
      filterStok === "semua" ||
      (filterStok === "tersedia" && b.stok > b.minStok) ||
      (filterStok === "menipis" && b.stok > 0 && b.stok <= b.minStok) ||
      (filterStok === "habis" && b.stok === 0);
    return matchSearch && matchKat && matchStok;
  });

  const stokLabel = (b: KatalogBarang) => {
    if (b.stok === 0) return { label: "Habis", color: "text-red-600 bg-red-50", dot: "bg-red-500" };
    if (b.stok <= b.minStok) return { label: "Menipis", color: "text-orange-600 bg-orange-50", dot: "bg-orange-500" };
    return { label: "Tersedia", color: "text-green-600 bg-green-50", dot: "bg-green-500" };
  };

  const summary = {
    total: katalogList.length,
    tersedia: katalogList.filter((b) => b.stok > b.minStok).length,
    menipis: katalogList.filter((b) => b.stok > 0 && b.stok <= b.minStok).length,
    habis: katalogList.filter((b) => b.stok === 0).length,
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-[#003580]">Beranda</a>
          <span>/</span>
          <span className="text-[#003580] font-semibold">Katalog Barang</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#003580]">Katalog Barang Tersedia</h1>
            <p className="text-gray-500 text-sm mt-1">Daftar barang yang tersedia di gudang beserta stok terkini.</p>
          </div>
          <Link href="/pemesanan" className="bg-[#003580] text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-900 transition shadow self-start md:self-auto">
            + Buat Pemesanan
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Barang", value: summary.total, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Stok Tersedia", value: summary.tersedia, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Stok Menipis", value: summary.menipis, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Stok Habis", value: summary.habis, color: "text-red-600", bg: "bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama barang atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {kategoriList.map((k) => <option key={k}>{k}</option>)}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Grid Barang */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border text-gray-400">
              <div className="flex justify-center mb-3"><Package size={40} className="text-gray-300" /></div>
              <p>Tidak ada barang yang cocok dengan filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((barang) => {
                const stok = stokLabel(barang);
                const isSelected = selected?.id === barang.id;
                return (
                  <div
                    key={barang.id}
                    onClick={() => setSelected(isSelected ? null : barang)}
                    className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition ${isSelected ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-100"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <ItemImage namaBarang={barang.namaBarang} kategori={barang.kategori} gambarUrl={barang.gambarUrl} gambarEmoji={barang.gambarEmoji} size={44} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${stok.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stok.dot}`} />
                        {stok.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{barang.namaBarang}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{barang.deskripsi}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Stok</p>
                        <p className="font-bold text-sm text-[#003580]">{barang.stok} <span className="font-normal text-gray-500">{barang.satuan}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Harga Satuan</p>
                        <p className="font-bold text-sm text-green-600">{formatRupiah(barang.hargaSatuan)}</p>
                      </div>
                    </div>
                    {barang.stok <= barang.minStok && barang.stok > 0 && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Stok di bawah minimum ({barang.minStok} {barang.satuan})
                      </div>
                    )}
                    {barang.stok === 0 && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1 flex items-center gap-1">
                        <XCircle size={12} /> Stok habis — perlu pengadaan segera
                      </div>
                    )}
                    <p className="text-xs text-blue-500 mt-2 text-center font-medium">Klik untuk detail</p>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4 text-center">Menampilkan {filtered.length} dari {katalogList.length} barang</p>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white rounded-xl border border-blue-200 shadow p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#003580] text-sm">Detail Barang</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  <ItemImage namaBarang={selected.namaBarang} kategori={selected.kategori} gambarUrl={selected.gambarUrl} gambarEmoji={selected.gambarEmoji} size={64} />
                </div>
                <h4 className="font-bold text-gray-800">{selected.namaBarang}</h4>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{selected.kategori}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 text-xs">Stok Saat Ini</span><span className="font-bold text-[#003580]">{selected.stok} {selected.satuan}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 text-xs">Stok Minimum</span><span className="text-xs">{selected.minStok} {selected.satuan}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 text-xs">Harga Satuan</span><span className="text-xs font-semibold text-green-600">{formatRupiah(selected.hargaSatuan)}</span></div>
                <hr />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-xs text-gray-700">{selected.deskripsi}</p>
                </div>
                {/* Stok bar */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Level Stok</p>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${selected.stok === 0 ? "bg-red-400" : selected.stok <= selected.minStok ? "bg-orange-400" : "bg-green-400"}`}
                      style={{ width: `${Math.min(100, (selected.stok / (selected.minStok * 3)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Min: {selected.minStok} {selected.satuan}</p>
                </div>
                <Link
                  href="/pemesanan"
                  className="block text-center bg-[#003580] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-900 transition mt-2"
                >
                  Pesan Barang Ini
                </Link>
                {(selected.stok === 0 || selected.stok <= selected.minStok) && (
                  <Link
                    href="/pengadaan"
                    className="block text-center bg-[#FFD700] text-[#003580] text-xs font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition"
                  >
                    Ajukan Pengadaan
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm sticky top-24">
              <div className="flex justify-center mb-3"><Package size={40} className="text-gray-300" /></div>
              <p>Klik barang untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
