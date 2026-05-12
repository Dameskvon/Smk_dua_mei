"use client";

import { useState } from "react";
import { formatTanggal } from "@/lib/data";
import { Notifikasi } from "@/types";
import { CheckCircle2, Info, AlertTriangle, XCircle, Bell, ArrowRight, ClipboardCheck, RefreshCw, ShoppingCart, Eye, BookCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppState } from "@/lib/appState";

const tipeConfig: Record<Notifikasi["tipe"], { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  sukses:    { icon: <CheckCircle2 size={20} />, color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  info:      { icon: <Info size={20} />,         color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"  },
  peringatan:{ icon: <AlertTriangle size={20} />,color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200"},
  ditolak:   { icon: <XCircle size={20} />,      color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"   },
};

export default function NotifikasiPage() {
  const { user } = useAuth();
  const { notifikasiList, tandaiBacaNotif, tandaiSemuaBaca, hapusNotif } = useAppState();

  const [filterTipe, setFilterTipe] = useState<"semua" | Notifikasi["tipe"]>("semua");
  const [filterBaca, setFilterBaca] = useState<"semua" | "belum" | "sudah">("semua");

  const roleFiltered = notifikasiList.filter((n) => {
    if (!user) return n.targetRole === "semua";
    if (user.role === "guru") return n.targetRole === "pemohon" || n.targetRole === "semua";
    if (user.role === "kepala_sekolah") return n.targetRole === "kepala_sekolah" || n.targetRole === "admin" || n.targetRole === "semua";
    return n.targetRole === "admin" || n.targetRole === "semua";
  });

  const filtered = roleFiltered.filter((n) => {
    const matchTipe = filterTipe === "semua" || n.tipe === filterTipe;
    const matchBaca = filterBaca === "semua" || (filterBaca === "belum" ? !n.sudahDibaca : n.sudahDibaca);
    return matchTipe && matchBaca;
  });

  const belumDibaca = roleFiltered.filter((n) => !n.sudahDibaca).length;

  const getAksi = (n: Notifikasi): { label: string; href: string; icon: React.ReactNode; style: string } | null => {
    if (n.tipe === "sukses") return { label: "Lihat Detail", href: "/riwayat", icon: <Eye size={13} />, style: "bg-green-600 hover:bg-green-700 text-white" };
    if (n.tipe === "info" && (n.targetRole === "admin" || n.targetRole === "kepala_sekolah")) return { label: "Tinjau & Proses", href: "/approval", icon: <ClipboardCheck size={13} />, style: "bg-[#003580] hover:bg-blue-900 text-white" };
    if (n.tipe === "info") return { label: "Pantau Status", href: "/riwayat", icon: <RefreshCw size={13} />, style: "bg-blue-500 hover:bg-blue-600 text-white" };
    if (n.tipe === "peringatan") return { label: "Ajukan Pengadaan", href: "/pengadaan", icon: <ShoppingCart size={13} />, style: "bg-orange-500 hover:bg-orange-600 text-white" };
    if (n.tipe === "ditolak") return { label: "Revisi Pengajuan", href: n.jenisForm === "pengadaan" ? "/pengadaan" : "/pemesanan", icon: <ArrowRight size={13} />, style: "bg-red-500 hover:bg-red-600 text-white" };
    return null;
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-[#003580]">Beranda</a>
          <span>/</span>
          <span className="text-[#003580] font-semibold">Notifikasi</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#003580] flex items-center gap-3">
              Notifikasi
              {belumDibaca > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{belumDibaca}</span>}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Notifikasi status pemesanan, pengadaan, dan peringatan stok.</p>
          </div>
          {belumDibaca > 0 && (
            <button onClick={tandaiSemuaBaca} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-400 text-blue-600 bg-white hover:bg-blue-50 transition">
              <BookCheck size={13} /> Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["sukses", "info", "peringatan", "ditolak"] as Notifikasi["tipe"][]).map((tipe) => {
          const cfg = tipeConfig[tipe];
          const count = roleFiltered.filter((n) => n.tipe === tipe).length;
          const label = { sukses: "Sukses", info: "Info", peringatan: "Peringatan", ditolak: "Ditolak" }[tipe];
          return (
            <div key={tipe} onClick={() => setFilterTipe(filterTipe === tipe ? "semua" : tipe)}
              className={`border rounded-xl p-3 text-center cursor-pointer transition hover:shadow ${cfg.bg} ${cfg.border} ${filterTipe === tipe ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}>
              <div className="flex justify-center mb-1">{cfg.icon}</div>
              <p className={`text-lg font-extrabold ${cfg.color}`}>{count}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter baca */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 flex gap-2">
        {(["semua", "belum", "sudah"] as const).map((b) => (
          <button key={b} onClick={() => setFilterBaca(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterBaca === b ? "bg-[#003580] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {b === "semua" ? "Semua" : b === "belum" ? "Belum Dibaca" : "Sudah Dibaca"}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border text-gray-400">
          <Bell size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = tipeConfig[n.tipe];
            const aksi = getAksi(n);
            return (
              <div key={n.id} className={`border rounded-xl p-4 transition ${cfg.bg} ${cfg.border} ${!n.sudahDibaca ? "shadow-md" : "opacity-75"}`}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${cfg.color}`}>{n.judul}</p>
                        {!n.sudahDibaca && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">Baru</span>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!n.sudahDibaca && (
                          <button onClick={() => tandaiBacaNotif(n.id)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-400 text-blue-600 bg-white hover:bg-blue-50 transition whitespace-nowrap">
                            <BookCheck size={12} /> Tandai Dibaca
                          </button>
                        )}
                        <button onClick={() => hapusNotif(n.id)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-300 text-red-500 bg-white hover:bg-red-50 transition">
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{n.pesan}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {n.nomorReferensi && (
                        <span className={`font-mono text-xs font-bold ${n.nomorReferensi.startsWith("PES") ? "text-blue-600" : "text-yellow-600"}`}>{n.nomorReferensi}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatTanggal(n.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {aksi && (
                        <a href={aksi.href} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${aksi.style}`}>
                          {aksi.icon} {aksi.label}
                        </a>
                      )}
                      {n.nomorReferensi && (
                        <a href="/riwayat" className={`text-xs font-medium hover:underline ${cfg.color}`}>Lihat detail →</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Menampilkan {filtered.length} dari {roleFiltered.length} notifikasi
      </p>
    </main>
  );
}
