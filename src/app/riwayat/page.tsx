"use client";

import { useState } from "react";
import { formatTanggal, formatRupiah } from "@/lib/data";
import { useAppState } from "@/lib/appState";
import StatusBadge from "@/components/StatusBadge";
import { Search, X } from "lucide-react";

type TabType = "semua" | "pemesanan" | "pengadaan";
type FilterStatus = "semua" | "menunggu" | "diproses" | "disetujui" | "ditolak" | "selesai";

export default function RiwayatPage() {
  const { permintaanList, pengadaanList } = useAppState();
  const [tab, setTab] = useState<TabType>("semua");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"pemesanan" | "pengadaan" | null>(null);

  const pemesananFiltered = permintaanList.filter((p) => {
    const matchStatus = filterStatus === "semua" || p.status === filterStatus;
    const matchSearch =
      !search ||
      p.nomorPesanan.toLowerCase().includes(search.toLowerCase()) ||
      p.namaPemesan.toLowerCase().includes(search.toLowerCase()) ||
      p.unitDepartemen.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pengadaanFiltered = pengadaanList.filter((p) => {
    const matchStatus = filterStatus === "semua" || p.status === filterStatus;
    const matchSearch =
      !search ||
      p.nomorPengadaan.toLowerCase().includes(search.toLowerCase()) ||
      p.namaPengaju.toLowerCase().includes(search.toLowerCase()) ||
      p.unitDepartemen.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedPemesanan = selectedItem && selectedType === "pemesanan"
    ? permintaanList.find((p) => p.id === selectedItem)
    : null;
  const selectedPengadaan = selectedItem && selectedType === "pengadaan"
    ? pengadaanList.find((p) => p.id === selectedItem)
    : null;

  const prioritasColor = (p: string) =>
    p === "tinggi" ? "text-red-600 bg-red-50" : p === "sedang" ? "text-yellow-600 bg-yellow-50" : "text-green-600 bg-green-50";

  return (
    <main className="w-full px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#003580]">Riwayat Pemesanan &amp; Pengadaan</h1>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nomor, nama, atau unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="semua">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="disetujui">Disetujui</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "semua", label: "Semua" },
          { key: "pemesanan", label: "Pemesanan" },
          { key: "pengadaan", label: "Pengadaan" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as TabType)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t.key
              ? "bg-[#003580] text-white shadow"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pemesanan */}
          {(tab === "semua" || tab === "pemesanan") && (
            <>
              {tab === "semua" && (
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pemesanan Barang</h3>
              )}
              {pemesananFiltered.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border">Tidak ada data pemesanan</div>
              ) : (
                pemesananFiltered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedItem(item.id); setSelectedType("pemesanan"); }}
                    className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition ${selectedItem === item.id && selectedType === "pemesanan" ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-100"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-xs text-blue-600 font-bold">{item.nomorPesanan}</p>
                        <p className="font-semibold text-sm text-gray-800">{item.namaPemesan}</p>
                        <p className="text-xs text-gray-500">{item.unitDepartemen} • {formatTanggal(item.tanggalPesan)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{item.keperluan}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prioritasColor(item.prioritas)}`}>
                        {item.prioritas.charAt(0).toUpperCase() + item.prioritas.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">{item.barangList.length} jenis barang</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Pengadaan */}
          {(tab === "semua" || tab === "pengadaan") && (
            <>
              {tab === "semua" && (
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-4">Pengadaan Barang</h3>
              )}
              {pengadaanFiltered.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border">Tidak ada data pengadaan</div>
              ) : (
                pengadaanFiltered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedItem(item.id); setSelectedType("pengadaan"); }}
                    className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition ${selectedItem === item.id && selectedType === "pengadaan" ? "border-yellow-400 ring-2 ring-yellow-200" : "border-gray-100"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-xs text-yellow-600 font-bold">{item.nomorPengadaan}</p>
                        <p className="font-semibold text-sm text-gray-800">{item.namaPengaju}</p>
                        <p className="text-xs text-gray-500">{item.unitDepartemen} • {formatTanggal(item.tanggalPengadaan)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{item.jenisBarang} — {item.spesifikasi}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prioritasColor(item.prioritas)}`}>
                        {item.prioritas.charAt(0).toUpperCase() + item.prioritas.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">{formatRupiah(item.estimasiHarga)}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {!selectedItem ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
              <div className="flex justify-center mb-3"><Search size={40} className="text-gray-300" /></div>
              <p>Klik salah satu item untuk melihat detail</p>
            </div>
          ) : selectedPemesanan ? (
            <div className="bg-white rounded-xl border border-blue-200 shadow p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#003580] text-sm">Detail Pemesanan</h3>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Nomor</span>
                  <span className="font-mono text-xs font-bold text-blue-600">{selectedPemesanan.nomorPesanan}</span>
                </div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Status</span><StatusBadge status={selectedPemesanan.status} /></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Pemesan</span><span className="text-xs font-medium">{selectedPemesanan.namaPemesan}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Jabatan</span><span className="text-xs">{selectedPemesanan.jabatan}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Unit</span><span className="text-xs">{selectedPemesanan.unitDepartemen}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Tgl Pesan</span><span className="text-xs">{formatTanggal(selectedPemesanan.tanggalPesan)}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Dibutuhkan</span><span className="text-xs">{formatTanggal(selectedPemesanan.tanggalDibutuhkan)}</span></div>
                <hr />
                <p className="text-xs font-semibold text-gray-600">Keperluan</p>
                <p className="text-xs text-gray-700">{selectedPemesanan.keperluan}</p>
                <hr />
                <p className="text-xs font-semibold text-gray-600">Daftar Barang</p>
                {selectedPemesanan.barangList.map((b, i) => (
                  <div key={b.id} className="text-xs bg-gray-50 rounded-lg p-2">
                    <span className="font-medium">{i + 1}. {b.namaBarang}</span>
                    <span className="text-gray-500"> — {b.jumlah} {b.satuan}</span>
                    {b.keterangan && <p className="text-gray-400 mt-0.5">{b.keterangan}</p>}
                  </div>
                ))}
                {selectedPemesanan.catatanAdmin && (
                  <>
                    <hr />
                    <p className="text-xs font-semibold text-gray-600">Catatan Admin</p>
                    <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded">{selectedPemesanan.catatanAdmin}</p>
                  </>
                )}
              </div>
            </div>
          ) : selectedPengadaan ? (
            <div className="bg-white rounded-xl border border-yellow-200 shadow p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#003580] text-sm">Detail Pengadaan</h3>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Nomor</span>
                  <span className="font-mono text-xs font-bold text-yellow-600">{selectedPengadaan.nomorPengadaan}</span>
                </div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Status</span><StatusBadge status={selectedPengadaan.status} /></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Pengaju</span><span className="text-xs font-medium">{selectedPengadaan.namaPengaju}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Jabatan</span><span className="text-xs">{selectedPengadaan.jabatan}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Unit</span><span className="text-xs">{selectedPengadaan.unitDepartemen}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Jenis Barang</span><span className="text-xs">{selectedPengadaan.jenisBarang}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Jumlah</span><span className="text-xs">{selectedPengadaan.jumlah} {selectedPengadaan.satuan}</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Sumber Dana</span><span className="text-xs">{selectedPengadaan.sumberDana}</span></div>
                <hr />
                <p className="text-xs font-semibold text-gray-600">Spesifikasi</p>
                <p className="text-xs text-gray-700">{selectedPengadaan.spesifikasi}</p>
                <hr />
                <p className="text-xs font-semibold text-gray-600">Estimasi Anggaran</p>
                <p className="text-base font-extrabold text-[#003580]">{formatRupiah(selectedPengadaan.estimasiHarga * selectedPengadaan.jumlah)}</p>
                <p className="text-xs text-gray-400">{selectedPengadaan.jumlah} × {formatRupiah(selectedPengadaan.estimasiHarga)}</p>
                {selectedPengadaan.catatanAdmin && (
                  <>
                    <hr />
                    <p className="text-xs font-semibold text-gray-600">Catatan Admin</p>
                    <p className="text-xs text-gray-700 bg-yellow-50 p-2 rounded">{selectedPengadaan.catatanAdmin}</p>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
