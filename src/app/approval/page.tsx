"use client";

import { useState } from "react";
import { formatTanggal } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle2, Clock, Send, ThumbsUp, ThumbsDown, PlayCircle, PackageCheck, MessageCircle, XCircle } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth";
import { useAppState } from "@/lib/appState";
import { FormPemesanan, FormPengadaan } from "@/types";

type TabView = "menunggu" | "disetujui" | "ditolak" | "semua";

export default function ApprovalPage() {
  const { user } = useAuth();
  const { permintaanList, pengadaanList, setujuiItem, tolakItem, prosesItem, selesaikanItem } = useAppState();

  const [tab, setTab] = useState<TabView>("menunggu");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedJenis, setSelectedJenis] = useState<"pemesanan" | "pengadaan" | null>(null);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);
  const [catatan, setCatatan] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isKepsek = user?.role === "kepala_sekolah";
  const isAdmin = user?.role === "admin" || user?.role === "admin_it";

  // Gabungkan semua item dengan label jenis
  type ItemRow = { id: string; jenis: "pemesanan" | "pengadaan"; nomor: string; nama: string; unit: string; perihal: string; status: string; prioritas: string; tanggal: string; catatanAdmin?: string };

  const allItems: ItemRow[] = [
    ...permintaanList.map((p): ItemRow => ({
      id: p.id, jenis: "pemesanan", nomor: p.nomorPesanan,
      nama: p.namaPemesan, unit: p.unitDepartemen, perihal: p.keperluan,
      status: p.status, prioritas: p.prioritas, tanggal: p.createdAt, catatanAdmin: p.catatanAdmin,
    })),
    ...pengadaanList.map((p): ItemRow => ({
      id: p.id, jenis: "pengadaan", nomor: p.nomorPengadaan,
      nama: p.namaPengaju, unit: p.unitDepartemen, perihal: p.jenisBarang,
      status: p.status, prioritas: p.prioritas, tanggal: p.createdAt, catatanAdmin: p.catatanAdmin,
    })),
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const filtered = allItems.filter((i) => {
    if (tab === "menunggu") return i.status === "menunggu";
    if (tab === "disetujui") return i.status === "disetujui" || i.status === "diproses";
    if (tab === "ditolak") return i.status === "ditolak";
    return true;
  });

  const menungguCount = allItems.filter((i) => i.status === "menunggu").length;
  const disetujuiCount = allItems.filter((i) => i.status === "disetujui" || i.status === "diproses").length;
  const ditolakCount = allItems.filter((i) => i.status === "ditolak").length;

  const selectedItem = selectedId
    ? allItems.find((i) => i.id === selectedId)
    : null;

  const getFullDetail = (): FormPemesanan | FormPengadaan | null => {
    if (!selectedId || !selectedJenis) return null;
    if (selectedJenis === "pemesanan") return permintaanList.find((p) => p.id === selectedId) ?? null;
    return pengadaanList.find((p) => p.id === selectedId) ?? null;
  };

  const handleSelect = (id: string, jenis: "pemesanan" | "pengadaan") => {
    setSelectedId(id);
    setSelectedJenis(jenis);
    setActionMode(null);
    setCatatan("");
  };

  const handleAction = (mode: "approve" | "reject") => {
    if (!selectedId || !selectedJenis || !user) return;
    if (mode === "reject" && !catatan.trim()) return;

    if (mode === "approve") {
      setujuiItem(selectedId, selectedJenis, catatan, user.nama);
      setSuccessMsg("Permintaan disetujui. Notifikasi telah dikirim ke pemohon dan Admin TU.");
    } else {
      tolakItem(selectedId, selectedJenis, catatan, user.nama);
      setSuccessMsg("Permintaan ditolak. Notifikasi telah dikirim ke pemohon.");
    }
    setActionMode(null);
    setCatatan("");
    setSelectedId(null);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleProses = () => {
    if (!selectedId || !selectedJenis) return;
    prosesItem(selectedId, selectedJenis);
    setSuccessMsg("Status diperbarui menjadi Diproses.");
    setSelectedId(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSelesai = () => {
    if (!selectedId || !selectedJenis) return;
    selesaikanItem(selectedId, selectedJenis);
    setSuccessMsg("Permintaan diselesaikan. Notifikasi telah dikirim ke pemohon.");
    setSelectedId(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const prioritasColor: Record<string, string> = {
    tinggi: "text-red-600 bg-red-50 border-red-200",
    sedang: "text-yellow-600 bg-yellow-50 border-yellow-200",
    rendah: "text-green-600 bg-green-50 border-green-200",
  };

  const fullDetail = getFullDetail();

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin", "admin_it"]}>
      <main className="w-full px-8 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#003580]">Persetujuan Permintaan</h1>
        </div>

        {/* Alur */}
        <div className="bg-gradient-to-r from-[#003580] to-[#0047AB] text-white rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: <PlayCircle size={16} />, label: "Guru Submit", active: false },
              { icon: <Clock size={16} />, label: "Pemesanan: Kepsek / Pengadaan: Langsung", active: isKepsek },
              { icon: <CheckCircle2 size={16} />, label: "Disetujui → Admin TU Proses", active: isAdmin },
              { icon: <PackageCheck size={16} />, label: "Selesai", active: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-blue-400 text-xs">→</span>}
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${step.active ? "bg-white text-[#003580]" : "bg-blue-800/50 text-blue-200"}`}>
                  {step.icon} {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Success */}
        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {([
            { key: "menunggu", label: "Menunggu Persetujuan", count: menungguCount },
            { key: "disetujui", label: "Disetujui / Diproses", count: disetujuiCount },
            { key: "ditolak", label: "Ditolak", count: ditolakCount },
            { key: "semua", label: "Semua", count: allItems.length },
          ] as { key: TabView; label: string; count: number }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelectedId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t.key ? "bg-[#003580] text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-sm">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-300" />
                    Tidak ada item di kategori ini
                  </div>
                ) : filtered.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.id, item.jenis)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${isSelected ? "bg-blue-50 border-l-4 border-[#003580]" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <p className={`font-mono text-xs font-bold ${item.jenis === "pemesanan" ? "text-blue-600" : "text-yellow-600"}`}>{item.nomor}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.nama}</p>
                      <p className="text-xs text-gray-500 truncate">{item.unit} · {item.perihal}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${prioritasColor[item.prioritas]}`}>{item.prioritas}</span>
                        <span className="text-xs text-gray-400">{formatTanggal(item.tanggal)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.jenis === "pemesanan" ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"}`}>
                          {item.jenis === "pemesanan" ? "Pemesanan" : "Pengadaan"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {!selectedItem ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center text-gray-400">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Pilih permintaan untuk melihat detail</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow p-6 space-y-5">
                {/* Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-mono text-sm font-bold ${selectedItem.jenis === "pemesanan" ? "text-blue-600" : "text-yellow-600"}`}>{selectedItem.nomor}</p>
                    <h3 className="font-bold text-[#003580] text-base mt-0.5">{selectedItem.nama}</h3>
                    <p className="text-xs text-gray-500">{selectedItem.unit} — {selectedItem.perihal}</p>
                  </div>
                  <StatusBadge status={selectedItem.status} />
                </div>

                {/* Detail barang */}
                {fullDetail && "barangList" in fullDetail && fullDetail.barangList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Daftar Barang</p>
                    <div className="space-y-1.5">
                      {fullDetail.barangList.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700">{b.namaBarang}</span>
                          <span className="text-gray-500 font-medium">{b.jumlah} {b.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fullDetail && "spesifikasi" in fullDetail && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <span className="font-semibold text-gray-500 text-xs uppercase block mb-1">Spesifikasi</span>
                    {fullDetail.spesifikasi}
                  </div>
                )}

                {/* Catatan admin sebelumnya */}
                {selectedItem.catatanAdmin && (
                  <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 flex items-start gap-2 text-sm text-gray-600">
                    <MessageCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{selectedItem.catatanAdmin}</span>
                  </div>
                )}

                {/* Tombol Admin TU: Proses langsung pengadaan tanpa persetujuan kepsek */}
                {isAdmin && selectedItem.jenis === "pengadaan" && selectedItem.status === "menunggu" && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-3 font-medium">Pengadaan barang tidak memerlukan persetujuan Kepala Sekolah:</p>
                    <button onClick={handleProses}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#003580] hover:bg-blue-900 text-white text-sm font-semibold rounded-xl transition">
                      <PlayCircle size={15} /> Mulai Proses Pengadaan
                    </button>
                  </div>
                )}

                {/* Tombol aksi Kepala Sekolah — hanya untuk pemesanan */}
                {isKepsek && selectedItem.status === "menunggu" && !actionMode && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-3 font-medium">Berikan keputusan Anda:</p>
                    <div className="flex gap-3">
                      <button onClick={() => setActionMode("approve")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
                        <ThumbsUp size={15} /> Setujui
                      </button>
                      <button onClick={() => setActionMode("reject")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition">
                        <ThumbsDown size={15} /> Tolak
                      </button>
                    </div>
                  </div>
                )}

                {/* Form approve/reject */}
                {isKepsek && actionMode && (
                  <div className={`border-t pt-4`}>
                    <div className={`rounded-xl p-4 ${actionMode === "approve" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                      <p className={`text-sm font-bold mb-3 flex items-center gap-1.5 ${actionMode === "approve" ? "text-green-700" : "text-red-700"}`}>
                        {actionMode === "approve" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {actionMode === "approve" ? "Konfirmasi Persetujuan" : "Konfirmasi Penolakan"}
                      </p>
                      <textarea
                        rows={3}
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder={actionMode === "approve" ? "Catatan persetujuan (opsional)..." : "Alasan penolakan (wajib)..."}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => { setActionMode(null); setCatatan(""); }}
                          className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition">
                          Batal
                        </button>
                        <button
                          onClick={() => handleAction(actionMode)}
                          disabled={actionMode === "reject" && !catatan.trim()}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-50 ${actionMode === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                          <Send size={14} />
                          {actionMode === "approve" ? "Kirim Persetujuan" : "Kirim Penolakan"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tombol Admin TU: Proses & Selesaikan */}
                {isAdmin && selectedItem.status === "disetujui" && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-3 font-medium">Tindak lanjuti permintaan yang telah disetujui:</p>
                    <button onClick={handleProses}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#003580] hover:bg-blue-900 text-white text-sm font-semibold rounded-xl transition">
                      <PlayCircle size={15} /> Mulai Proses Pengadaan
                    </button>
                  </div>
                )}

                {isAdmin && selectedItem.status === "diproses" && (
                  <div className="border-t pt-4">
                    <button onClick={handleSelesai}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
                      <PackageCheck size={15} /> Tandai Selesai & Kirim Notifikasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
