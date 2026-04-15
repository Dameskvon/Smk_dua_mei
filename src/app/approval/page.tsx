import { useState } from "react";
import { dataApproval, dataPemesanan, dataPengadaan, formatTanggal } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import { ApprovalStep } from "@/types";
import { CheckCircle2, XCircle, Pencil, Clock, MessageCircle } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

export default function ApprovalPage() {
  const [filterNomor, setFilterNomor] = useState("");
  const [selectedNomor, setSelectedNomor] = useState<string | null>(null);

  // Gabungkan semua nomor referensi unik dari approval
  const nomorList = Array.from(new Set(dataApproval.map((a) => a.nomorReferensi)));

  const filtered = nomorList.filter((n) => !filterNomor || n.toLowerCase().includes(filterNomor.toLowerCase()));

  const getApprovalSteps = (nomor: string): ApprovalStep[] =>
    dataApproval.filter((a) => a.nomorReferensi === nomor).sort((a, b) => a.langkah - b.langkah);

  const getFormDetail = (nomor: string) => {
    const pemesanan = dataPemesanan.find((p) => p.nomorPesanan === nomor);
    if (pemesanan) return { jenis: "pemesanan" as const, data: pemesanan, nama: pemesanan.namaPemesan, unit: pemesanan.unitDepartemen, perihal: pemesanan.keperluan, status: pemesanan.status };
    const pengadaan = dataPengadaan.find((p) => p.nomorPengadaan === nomor);
    if (pengadaan) return { jenis: "pengadaan" as const, data: pengadaan, nama: pengadaan.namaPengaju, unit: pengadaan.unitDepartemen, perihal: pengadaan.jenisBarang, status: pengadaan.status };
    return null;
  };

  const stepStatusIcon = (status: ApprovalStep["status"]) => {
    if (status === "disetujui") return { icon: <CheckCircle2 size={16} />, color: "text-green-600 bg-green-100 border-green-300" };
    if (status === "ditolak") return { icon: <XCircle size={16} />, color: "text-red-600 bg-red-100 border-red-300" };
    if (status === "revisi") return { icon: <Pencil size={16} />, color: "text-orange-600 bg-orange-100 border-orange-300" };
    return { icon: <Clock size={16} />, color: "text-gray-400 bg-gray-100 border-gray-200" };
  };

  // Konfigurasi struktur alur persetujuan standar
  const strukturAlur = [
    { langkah: 1, jabatan: "Waka Sarana Prasarana", keterangan: "Verifikasi kebutuhan dan kesesuaian anggaran" },
    { langkah: 2, jabatan: "Bendahara / Kepala TU", keterangan: "Verifikasi ketersediaan dana" },
    { langkah: 3, jabatan: "Kepala Sekolah", keterangan: "Persetujuan final" },
  ];

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin"]}>
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-[#003580]">Beranda</a>
            <span>/</span>
            <span className="text-[#003580] font-semibold">Alur Persetujuan</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#003580]">Alur Persetujuan (Approval Workflow)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pantau proses persetujuan setiap permintaan pemesanan dan pengadaan barang.
          </p>
        </div>

        {/* Struktur Alur Standar */}
        <div className="bg-gradient-to-r from-[#003580] to-[#0047AB] text-white rounded-xl p-6 mb-6">
          <h2 className="font-bold text-sm mb-4 text-blue-200">Struktur Alur Persetujuan Standar SMK Dua Mei</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strukturAlur.map((s, i) => (
              <div key={s.langkah} className="relative flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#FFD700] text-[#003580] font-extrabold text-sm flex items-center justify-center shrink-0 shadow">
                    {s.langkah}
                  </div>
                  {i < strukturAlur.length - 1 && (
                    <div className="hidden md:block absolute top-4 left-8 w-full h-0.5 bg-blue-400 opacity-50 z-0" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.jabatan}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{s.keterangan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List Pengajuan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Cari nomor pengajuan..."
                  value={filterNomor}
                  onChange={(e) => setFilterNomor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                {filtered.map((nomor) => {
                  const detail = getFormDetail(nomor);
                  const steps = getApprovalSteps(nomor);
                  const selesai = steps.filter((s) => s.status !== "menunggu").length;
                  const isSelected = selectedNomor === nomor;
                  return (
                    <div
                      key={nomor}
                      onClick={() => setSelectedNomor(isSelected ? null : nomor)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className={`font-mono text-xs font-bold ${nomor.startsWith("PES") ? "text-blue-600" : "text-yellow-600"}`}>{nomor}</p>
                        {detail && <StatusBadge status={detail.status} />}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{detail?.nama ?? "-"}</p>
                      <p className="text-xs text-gray-500">{detail?.unit} • {detail?.perihal}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {steps.map((s) => {
                            const st = stepStatusIcon(s.status);
                            return (
                              <span key={s.id} className={`text-xs w-5 h-5 flex items-center justify-center rounded-full border ${st.color}`}>
                                {st.icon}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-400">{selesai}/{steps.length} langkah</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail Approval */}
          <div className="lg:col-span-3">
            {!selectedNomor ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center text-gray-400">
                <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-gray-300" /></div>
                <p className="text-sm">Pilih pengajuan untuk melihat alur persetujuan</p>
              </div>
            ) : (() => {
              const detail = getFormDetail(selectedNomor);
              const steps = getApprovalSteps(selectedNomor);
              return (
                <div className="bg-white rounded-xl border border-gray-100 shadow p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className={`font-mono text-sm font-bold ${selectedNomor.startsWith("PES") ? "text-blue-600" : "text-yellow-600"}`}>{selectedNomor}</p>
                      <h3 className="font-bold text-[#003580] text-base">{detail?.nama}</h3>
                      <p className="text-xs text-gray-500">{detail?.unit} — {detail?.perihal}</p>
                    </div>
                    {detail && <StatusBadge status={detail.status} />}
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    {steps.map((step, idx) => {
                      const st = stepStatusIcon(step.status);
                      const isLast = idx === steps.length - 1;
                      return (
                        <div key={step.id} className="flex gap-4 relative">
                          {/* Line */}
                          {!isLast && (
                            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200 z-0" />
                          )}
                          {/* Step circle */}
                          <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${st.color}`}>
                            {step.status === "menunggu" ? step.langkah : st.icon}
                          </div>
                          {/* Content */}
                          <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-sm text-gray-800">Langkah {step.langkah}: {step.namaApprover}</p>
                                <p className="text-xs text-gray-500">{step.jabatanApprover}</p>
                              </div>
                              <p className="text-xs text-gray-400">{formatTanggal(step.tanggal)}</p>
                            </div>
                            {step.catatan && (
                              <div className={`mt-2 text-xs px-3 py-2 rounded-lg flex items-start gap-1.5 ${step.status === "disetujui" ? "bg-green-50 text-green-700" :
                                  step.status === "ditolak" ? "bg-red-50 text-red-700" :
                                    step.status === "revisi" ? "bg-orange-50 text-orange-700" :
                                      "bg-gray-50 text-gray-600"
                                }`}>
                                <MessageCircle size={12} className="mt-0.5 shrink-0" /> {step.catatan}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Pending steps (jika belum ada di data) */}
                    {strukturAlur.filter((s) => !steps.find((st) => st.langkah === s.langkah)).map((s) => (
                      <div key={s.langkah} className="flex gap-4 relative opacity-40">
                        <div className="relative z-10 w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                          {s.langkah}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-semibold text-sm text-gray-500">Langkah {s.langkah}: {s.jabatan}</p>
                          <p className="text-xs text-gray-400">{s.keterangan}</p>
                          <span className="text-xs text-gray-400 mt-1 block">Menunggu proses sebelumnya...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
