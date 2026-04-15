"use client";

import { useState } from "react";
import { dataNotifikasi, formatTanggal } from "@/lib/data";
import { Notifikasi } from "@/types";
import { CheckCircle2, Info, AlertTriangle, XCircle, Bell } from "lucide-react";

const tipeConfig: Record<Notifikasi["tipe"], { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  sukses:    { icon: <CheckCircle2 size={20} />, color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  info:      { icon: <Info size={20} />,         color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"  },
  peringatan:{ icon: <AlertTriangle size={20} />,color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200"},
  ditolak:   { icon: <XCircle size={20} />,      color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"   },
};

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<Notifikasi[]>(dataNotifikasi);
  const [filterRole, setFilterRole] = useState<"semua" | "pemohon" | "admin">("semua");
  const [filterTipe, setFilterTipe] = useState<"semua" | Notifikasi["tipe"]>("semua");
  const [filterBaca, setFilterBaca] = useState<"semua" | "belum" | "sudah">("semua");

  const filtered = notifs.filter((n) => {
    const matchRole = filterRole === "semua" || n.targetRole === filterRole || n.targetRole === "semua";
    const matchTipe = filterTipe === "semua" || n.tipe === filterTipe;
    const matchBaca = filterBaca === "semua" || (filterBaca === "belum" ? !n.sudahDibaca : n.sudahDibaca);
    return matchRole && matchTipe && matchBaca;
  });

  const belumDibaca = notifs.filter((n) => !n.sudahDibaca).length;

  const tandaiBaca = (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, sudahDibaca: true } : n));
  };

  const tandaiSemuaBaca = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, sudahDibaca: true })));
  };

  const hapusNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
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
              {belumDibaca > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{belumDibaca}</span>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Notifikasi status pemesanan, pengadaan, dan peringatan stok.</p>
          </div>
          {belumDibaca > 0 && (
            <button
              onClick={tandaiSemuaBaca}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Tandai semua telah dibaca
            </button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Sukses", tipe: "sukses" as const, count: notifs.filter((n) => n.tipe === "sukses").length },
          { label: "Info", tipe: "info" as const, count: notifs.filter((n) => n.tipe === "info").length },
          { label: "Peringatan", tipe: "peringatan" as const, count: notifs.filter((n) => n.tipe === "peringatan").length },
          { label: "Ditolak", tipe: "ditolak" as const, count: notifs.filter((n) => n.tipe === "ditolak").length },
        ].map((s) => {
          const cfg = tipeConfig[s.tipe];
          return (
            <div key={s.label} className={`border rounded-xl p-3 text-center cursor-pointer transition hover:shadow ${cfg.bg} ${cfg.border} ${filterTipe === s.tipe ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
              onClick={() => setFilterTipe(filterTipe === s.tipe ? "semua" : s.tipe)}>
              <div className="flex justify-center mb-1">{cfg.icon}</div>
              <p className={`text-lg font-extrabold ${cfg.color}`}>{s.count}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["semua", "pemohon", "admin"] as const).map((r) => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterRole === r ? "bg-[#003580] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {r === "semua" ? "Semua Role" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex gap-2">
          {(["semua", "belum", "sudah"] as const).map((b) => (
            <button key={b} onClick={() => setFilterBaca(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterBaca === b ? "bg-[#003580] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {b === "semua" ? "Semua" : b === "belum" ? "Belum Dibaca" : "Sudah Dibaca"}
            </button>
          ))}
        </div>
      </div>

      {/* Notif List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border text-gray-400">
          <div className="flex justify-center mb-3"><Bell size={40} className="text-gray-300" /></div>
          <p>Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = tipeConfig[n.tipe];
            return (
              <div
                key={n.id}
                className={`border rounded-xl p-4 transition ${cfg.bg} ${cfg.border} ${!n.sudahDibaca ? "shadow-md" : "opacity-75"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${cfg.color}`}>{n.judul}</p>
                        {!n.sudahDibaca && (
                          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">Baru</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.color} bg-white`}>
                          {n.targetRole === "semua" ? "Semua" : n.targetRole.charAt(0).toUpperCase() + n.targetRole.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!n.sudahDibaca && (
                          <button onClick={() => tandaiBaca(n.id)} className="text-xs text-blue-500 hover:underline whitespace-nowrap">
                            Tandai dibaca
                          </button>
                        )}
                        <button onClick={() => hapusNotif(n.id)} className="text-xs text-red-400 hover:underline">
                          Hapus
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{n.pesan}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {n.nomorReferensi && (
                        <span className={`font-mono text-xs font-bold ${n.nomorReferensi.startsWith("PES") ? "text-blue-600" : "text-yellow-600"}`}>
                          {n.nomorReferensi}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatTanggal(n.createdAt)}</span>
                    </div>
                    {n.nomorReferensi && (
                      <a
                        href="/riwayat"
                        className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                      >
                        Lihat detail pengajuan →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Menampilkan {filtered.length} dari {notifs.length} notifikasi
      </p>
    </main>
  );
}
