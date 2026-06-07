"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { unitDepartemenList } from "@/lib/data";
import { BarangItem } from "@/types";
import { CheckCircle2, Plus, Trash2, ClipboardList, Package, MessageSquare, Send, ArrowRight, RotateCcw, X, ImageIcon, RefreshCw } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth";
import { useAppState } from "@/lib/appState";

interface FormData {
  namaPemesan: string;
  jabatan: string;
  unitDepartemen: string;
  keperluan: string;
  tanggalDibutuhkan: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  catatanPemesan: string;
}

const initialForm: FormData = {
  namaPemesan: "",
  jabatan: "",
  unitDepartemen: "",
  keperluan: "",
  tanggalDibutuhkan: "",
  prioritas: "sedang",
  catatanPemesan: "",
};

const initialBarang: BarangItem = { id: "", namaBarang: "", jumlah: 1, satuan: "", keterangan: "" };

const prioritasOptions = [
  { value: "rendah", label: "Rendah", activeColor: "text-green-700 bg-green-100 border-green-400 shadow-sm" },
  { value: "sedang", label: "Sedang", activeColor: "text-yellow-700 bg-yellow-100 border-yellow-400 shadow-sm" },
  { value: "tinggi", label: "Tinggi / Mendesak", activeColor: "text-red-700 bg-red-100 border-red-400 shadow-sm" },
];

export default function PemesananPage() {
  const { user } = useAuth();
  const { submitPermintaan, revisiPermintaan, permintaanList, katalogList, isLoading } = useAppState();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormData>({
    ...initialForm,
    namaPemesan: user?.nama ?? "",
    jabatan: user?.jabatan ?? "",
    unitDepartemen: user?.unitDepartemen ?? "",
  });
  const [barangList, setBarangList] = useState<BarangItem[]>([{ ...initialBarang, id: "1" }]);
  const [barangKategori, setBarangKategori] = useState<Record<string, string>>({});
  const [barangFoto, setBarangFoto] = useState<Record<string, { id: string; name: string; preview: string }[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [nomorPesanan, setNomorPesanan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [revisiDari, setRevisiDari] = useState<string | null>(null);

  useEffect(() => {
    const nomorRevisi = searchParams.get("revisi");
    if (!nomorRevisi) return;
    const asli = permintaanList.find((p) => p.nomorPesanan === nomorRevisi);
    if (!asli) return;
    setRevisiDari(nomorRevisi);
    setForm({
      namaPemesan: asli.namaPemesan,
      jabatan: asli.jabatan,
      unitDepartemen: asli.unitDepartemen,
      keperluan: asli.keperluan,
      tanggalDibutuhkan: asli.tanggalDibutuhkan,
      prioritas: asli.prioritas,
      catatanPemesan: asli.catatanPemesan ?? "",
    });
    setBarangList(asli.barangList.map((b) => ({ ...b, id: b.id || Date.now().toString() })));
  }, [searchParams, permintaanList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleBarangChange = (id: string, field: keyof BarangItem, value: string | number) => {
    setBarangList(barangList.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const addBarang = () => setBarangList([...barangList, { ...initialBarang, id: Date.now().toString() }]);
  const removeBarang = (id: string) => { if (barangList.length > 1) setBarangList(barangList.filter((b) => b.id !== id)); };

  const handleFotoChange = (barangId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBarangFoto((prev) => ({
          ...prev,
          [barangId]: [
            ...(prev[barangId] ?? []),
            { id: Date.now().toString() + Math.random(), name: file.name, preview: ev.target?.result as string },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };
  const removeFoto = (barangId: string, fotoId: string) => {
    setBarangFoto((prev) => ({ ...prev, [barangId]: (prev[barangId] ?? []).filter((f) => f.id !== fotoId) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.namaPemesan) e.namaPemesan = "Nama wajib diisi";
    if (!form.jabatan) e.jabatan = "Jabatan wajib diisi";
    if (!form.unitDepartemen) e.unitDepartemen = "Unit/Departemen wajib dipilih";
    if (!form.keperluan) e.keperluan = "Keperluan wajib diisi";
    if (!form.tanggalDibutuhkan) e.tanggalDibutuhkan = "Tanggal dibutuhkan wajib diisi";
    barangList.forEach((b, i) => {
      if (!b.namaBarang) e[`barang_nama_${i}`] = "Nama barang wajib diisi";
      if (!b.satuan) e[`barang_satuan_${i}`] = "Satuan wajib diisi";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    let nomor: string;

    if (revisiDari) {
      const asli = permintaanList.find((p) => p.nomorPesanan === revisiDari);
      if (asli) {
        nomor = await revisiPermintaan(
          asli.id,
          { keperluan: form.keperluan, tanggalDibutuhkan: form.tanggalDibutuhkan, prioritas: form.prioritas, catatanPemesan: form.catatanPemesan, barangList },
          user?.nama ?? form.namaPemesan
        );
      } else {
        nomor = await submitPermintaan(
          { ...form, barangList, tanggalPesan: new Date().toISOString().split("T")[0] },
          user?.nama ?? form.namaPemesan
        );
      }
    } else {
      nomor = await submitPermintaan(
        { ...form, barangList, tanggalPesan: new Date().toISOString().split("T")[0] },
        user?.nama ?? form.namaPemesan
      );
    }

    setNomorPesanan(nomor);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setForm({ ...initialForm, namaPemesan: user?.nama ?? "", jabatan: user?.jabatan ?? "", unitDepartemen: user?.unitDepartemen ?? "" });
    setBarangList([{ ...initialBarang, id: "1" }]);
    setBarangFoto({});
    setSubmitted(false);
    setNomorPesanan("");
    setErrors({});
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <ProtectedPage allowedRoles={["guru"]}>
        <main className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-green-100 overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl" style={{ background: "linear-gradient(90deg, #003580, #0047AB, #22c55e)" }} />
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-50 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full" />

            <div className="relative z-10">
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={44} className="text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                {revisiDari ? "Revisi Terkirim!" : "Pemesanan Terkirim!"}
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                {revisiDari
                  ? `Pemesanan ${revisiDari} telah diperbarui dan dikirim ulang ke Kepala Sekolah untuk ditinjau.`
                  : "Permintaan Anda telah diterima dan diteruskan ke Kepala Sekolah untuk ditinjau."}
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 text-left">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nomor Referensi</p>
                <p className="text-2xl font-mono font-extrabold text-[#003580] tracking-wider">{nomorPesanan}</p>
                <p className="text-xs text-gray-400 mt-2">Simpan nomor ini untuk memantau status di halaman Riwayat.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                <p className="text-xs font-bold text-amber-700 mb-1">Alur Persetujuan</p>
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <span className="font-medium">Anda</span>
                  <ArrowRight size={12} />
                  <span className="font-medium">Kepala Sekolah</span>
                  <ArrowRight size={12} />
                  <span className="font-medium">Admin TU</span>
                  <ArrowRight size={12} />
                  <span className="font-medium text-green-700">Selesai</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#003580] hover:bg-blue-900 text-white font-bold px-5 py-3 rounded-xl transition text-sm shadow"
                >
                  <RotateCcw size={15} /> Buat Baru
                </button>
                <a
                  href="/riwayat"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl transition text-sm"
                >
                  Lihat Riwayat <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  const inputBase = "w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580] transition bg-white";
  const inputError = (key: string) => errors[key] ? "border-red-400 bg-red-50/30" : "border-gray-200";
  const label = (text: string, required = false) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <ProtectedPage allowedRoles={["guru"]}>
      <main className="w-full px-8 py-10">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl font-extrabold text-blue-900">Form Pemesanan Barang</h1>
        </div>

        {/* Banner Revisi */}
        {revisiDari && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <RefreshCw size={18} className="text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-orange-700">Revisi Pemesanan</p>
              <p className="text-xs text-orange-600 mt-0.5">
                Form ini sudah diisi dari pemesanan <span className="font-mono font-bold">{revisiDari}</span> yang ditolak. Perbaiki data yang diperlukan lalu kirim ulang.
              </p>
            </div>
          </div>
        )}

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-8 animate-slide-up delay-75">
          {[
            { n: 1, label: "Data Pemesan" },
            { n: 2, label: "Daftar Barang" },
            { n: 3, label: "Catatan" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                  style={{ background: "linear-gradient(135deg, #003580, #0047AB)", color: "white" }}>
                  {s.n}
                </div>
                <span className="text-xs font-semibold text-gray-600 hidden sm:block">{s.label}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 — Data Pemesan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up delay-150">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #003580, #0047AB)" }}>
                <ClipboardList size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-[#003580] text-sm">Data Pemesan</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                {label("Nama Lengkap", true)}
                <input type="text" name="namaPemesan" value={form.namaPemesan} onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className={`${inputBase} ${inputError("namaPemesan")}`} />
                {errors.namaPemesan && <p className="text-red-500 text-xs mt-1">{errors.namaPemesan}</p>}
              </div>
              <div>
                {label("Jabatan / Mata Pelajaran", true)}
                <input type="text" name="jabatan" value={form.jabatan} onChange={handleChange}
                  placeholder="Contoh: Guru Produktif TKJ"
                  className={`${inputBase} ${inputError("jabatan")}`} />
                {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
              </div>
              <div>
                {label("Unit / Departemen", true)}
                <select name="unitDepartemen" value={form.unitDepartemen} onChange={handleChange}
                  className={`${inputBase} ${inputError("unitDepartemen")}`}>
                  <option value="">-- Pilih Unit/Departemen --</option>
                  {unitDepartemenList.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                {errors.unitDepartemen && <p className="text-red-500 text-xs mt-1">{errors.unitDepartemen}</p>}
              </div>
              <div>
                {label("Tanggal Dibutuhkan", true)}
                <input type="date" name="tanggalDibutuhkan" value={form.tanggalDibutuhkan} onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${inputBase} ${inputError("tanggalDibutuhkan")}`} />
                {errors.tanggalDibutuhkan && <p className="text-red-500 text-xs mt-1">{errors.tanggalDibutuhkan}</p>}
              </div>
              <div className="md:col-span-2">
                {label("Keperluan / Tujuan Pemesanan", true)}
                <textarea name="keperluan" value={form.keperluan} onChange={handleChange} rows={2}
                  placeholder="Jelaskan keperluan pemesanan barang ini"
                  className={`${inputBase} resize-none ${inputError("keperluan")}`} />
                {errors.keperluan && <p className="text-red-500 text-xs mt-1">{errors.keperluan}</p>}
              </div>
              <div>
                {label("Prioritas")}
                <select name="prioritas" value={form.prioritas}
                  onChange={(e) => setForm({ ...form, prioritas: e.target.value as FormData["prioritas"] })}
                  className={`${inputBase} border-gray-200 bg-white`}>
                  {prioritasOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 — Daftar Barang */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up delay-300">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500">
                <Package size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-amber-800 text-sm">Daftar Barang</h2>
              <span className="ml-auto text-xs text-gray-400 font-medium">{barangList.length} item</span>
            </div>
            <div className="p-6 space-y-4">
              {barangList.map((barang, index) => (
                <div key={barang.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#003580] bg-blue-100 px-2.5 py-1 rounded-full">
                      Barang #{index + 1}
                    </span>
                    {barangList.length > 1 && (
                      <button type="button" onClick={() => removeBarang(barang.id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-semibold transition opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} /> Hapus
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Jenis Barang */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Barang <span className="text-red-500">*</span></label>
                      <select
                        value={barangKategori[barang.id] ?? ""}
                        onChange={(e) => {
                          setBarangKategori((prev) => ({ ...prev, [barang.id]: e.target.value }));
                          handleBarangChange(barang.id, "namaBarang", "");
                        }}
                        className={`${inputBase} border-gray-200`}
                      >
                        <option value="">-- Pilih Jenis --</option>
                        {Array.from(new Set(katalogList.map((k) => k.kategori))).sort().map((kat) => (
                          <option key={kat} value={kat}>{kat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Nama Barang — difilter dari katalog berdasarkan jenis */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Barang <span className="text-red-500">*</span></label>
                      <select
                        value={barang.namaBarang}
                        onChange={(e) => handleBarangChange(barang.id, "namaBarang", e.target.value)}
                        disabled={!barangKategori[barang.id]}
                        className={`${inputBase} ${errors[`barang_nama_${index}`] ? "border-red-400" : "border-gray-200"} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                      >
                        <option value="">-- Pilih Barang --</option>
                        {katalogList
                          .filter((k) => k.kategori === barangKategori[barang.id])
                          .map((k) => (
                            <option key={k.id} value={k.namaBarang}>{k.namaBarang}</option>
                          ))}
                      </select>
                      {errors[`barang_nama_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`barang_nama_${index}`]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah <span className="text-red-500">*</span></label>
                      <input type="number" value={barang.jumlah} min={1}
                        onChange={(e) => handleBarangChange(barang.id, "jumlah", parseInt(e.target.value) || 1)}
                        className={`${inputBase} border-gray-200`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Satuan <span className="text-red-500">*</span></label>
                      <input type="text" value={barang.satuan}
                        onChange={(e) => handleBarangChange(barang.id, "satuan", e.target.value)}
                        placeholder="Pcs / Rim / Unit"
                        className={`${inputBase} ${errors[`barang_satuan_${index}`] ? "border-red-400" : "border-gray-200"}`} />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Keterangan (opsional)</label>
                      <input type="text" value={barang.keterangan || ""}
                        onChange={(e) => handleBarangChange(barang.id, "keterangan", e.target.value)}
                        placeholder="Spesifikasi, merek, warna, dll."
                        className={`${inputBase} border-gray-200`} />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Foto Barang (opsional)</label>
                      {(barangFoto[barang.id] ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(barangFoto[barang.id] ?? []).map((f) => (
                            <div key={f.id} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeFoto(barang.id, f.id)}
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center"
                              >
                                <X size={14} className="text-white opacity-0 group-hover:opacity-100 transition" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 transition cursor-pointer w-fit">
                        <ImageIcon size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Tambah foto</span>
                        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFotoChange(barang.id, e)} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addBarang}
                className="flex items-center gap-2 text-[#003580] border-2 border-dashed border-[#003580]/30 hover:border-[#003580]/60 hover:bg-blue-50/50 w-full py-3 rounded-xl text-sm font-semibold transition justify-center">
                <Plus size={16} /> Tambah Barang
              </button>
            </div>
          </div>

          {/* Section 3 — Catatan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up delay-500">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500">
                <MessageSquare size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-purple-800 text-sm">Catatan Tambahan</h2>
              <span className="ml-auto text-xs text-gray-400">Opsional</span>
            </div>
            <div className="p-6">
              <textarea name="catatanPemesan" value={form.catatanPemesan} onChange={handleChange} rows={3}
                placeholder="Catatan atau informasi tambahan untuk tim pengadaan..."
                className={`${inputBase} resize-none border-gray-200`} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 pb-8">
            <button type="button" onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-orange-300 bg-orange-50 text-orange-600 font-semibold text-sm hover:bg-orange-100 hover:border-orange-400 transition">
              <RotateCcw size={15} /> Reset Form
            </button>
            <button type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #003580 0%, #0047AB 100%)" }}>
              <Send size={15} /> Kirim Pemesanan
            </button>
          </div>
        </form>
      </main>
    </ProtectedPage>
  );
}
