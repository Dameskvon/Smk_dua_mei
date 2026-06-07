"use client";

import { useState } from "react";
import { unitDepartemenList, formatRupiah } from "@/lib/data";
import { useAppState } from "@/lib/appState";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, Send, RotateCcw, ImageIcon, X } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

interface FormData {
  namaPengaju: string;
  jabatan: string;
  unitDepartemen: string;
  jenisBarang: string;
  spesifikasi: string;
  jumlah: number;
  satuan: string;
  estimasiHarga: string;
  tujuanPengadaan: string;
  sumberDana: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  catatanPengaju: string;
}

const initialForm: FormData = {
  namaPengaju: "",
  jabatan: "",
  unitDepartemen: "",
  jenisBarang: "",
  spesifikasi: "",
  jumlah: 1,
  satuan: "",
  estimasiHarga: "",
  tujuanPengadaan: "",
  sumberDana: "",
  prioritas: "sedang",
  catatanPengaju: "",
};

const jenisBarangList = [
  "Peralatan Elektronik",
  "Furnitur & Perlengkapan",
  "Alat Tulis & Kertas",
  "Peralatan Lab / Praktik",
  "Software & Lisensi",
  "Buku & Referensi",
  "Peralatan Olahraga",
  "Perlengkapan Kebersihan",
  "Peralatan Medis / UKS",
  "Lainnya",
];

const sumberDanaList = ["Dana BOS", "Dana Komite", "Dana Yayasan", "Dana APBN", "Dana Hibah", "Lainnya"];

export default function PengadaanPage() {
  const { submitPengadaan } = useAppState();
  const { user } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [foto, setFoto] = useState<{ id: string; name: string; preview: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [nomorPengadaan, setNomorPengadaan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "jumlah" ? parseInt(value) || 1 : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.namaPengaju) newErrors.namaPengaju = "Nama wajib diisi";
    if (!form.jabatan) newErrors.jabatan = "Jabatan wajib diisi";
    if (!form.unitDepartemen) newErrors.unitDepartemen = "Unit/Departemen wajib dipilih";
    if (!form.jenisBarang) newErrors.jenisBarang = "Jenis barang wajib dipilih";
    if (!form.spesifikasi) newErrors.spesifikasi = "Spesifikasi wajib diisi";
    if (!form.satuan) newErrors.satuan = "Satuan wajib diisi";
    if (!form.estimasiHarga) newErrors.estimasiHarga = "Estimasi harga wajib diisi";
    if (!form.tujuanPengadaan) newErrors.tujuanPengadaan = "Tujuan pengadaan wajib diisi";
    if (!form.sumberDana) newErrors.sumberDana = "Sumber dana wajib dipilih";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    const nomor = await submitPengadaan(
      {
        ...form,
        estimasiHarga: parseInt(form.estimasiHarga.replace(/\D/g, "")) || 0,
        tanggalPengadaan: new Date().toISOString().split("T")[0],
        dokumenPendukung: undefined,
        catatanAdmin: undefined,
      },
      user?.nama ?? form.namaPengaju
    );
    setNomorPengadaan(nomor);
    setSubmitted(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFoto((prev) => [
          ...prev,
          { id: Date.now().toString() + Math.random(), name: file.name, preview: ev.target?.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeFoto = (id: string) => setFoto((prev) => prev.filter((f) => f.id !== id));

  const handleReset = () => {
    setForm(initialForm);
    setFoto([]);
    setSubmitted(false);
    setNomorPengadaan("");
    setErrors({});
  };

  const totalEstimasi =
    form.estimasiHarga && form.jumlah
      ? parseInt(form.estimasiHarga.replace(/\D/g, "")) * form.jumlah
      : 0;

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 shadow">
          <div className="flex justify-center mb-4"><CheckCircle2 size={48} className="text-green-600" /></div>
          <h2 className="text-2xl font-extrabold text-green-700 mb-2">Pengadaan Berhasil Diajukan!</h2>
          <p className="text-gray-600 mb-4">
            Formulir pengadaan barang Anda telah diterima dan akan diproses oleh tim pengadaan.
          </p>
          <div className="bg-white border border-green-300 rounded-xl p-4 mb-6 inline-block">
            <p className="text-xs text-gray-500 mb-1">Nomor Referensi Pengadaan</p>
            <p className="text-xl font-mono font-bold text-[#003580]">{nomorPengadaan}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Simpan nomor ini untuk memantau perkembangan pengadaan Anda di halaman Riwayat.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="bg-[#003580] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-900 transition text-sm"
            >
              Ajukan Pengadaan Baru
            </button>
            <a
              href="/riwayat"
              className="bg-gray-100 text-gray-700 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Lihat Riwayat
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <ProtectedPage allowedRoles={["guru", "admin", "admin_it"]}>
      <main className="w-full px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[#003580]">Form Pengadaan Barang Internal</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Data Pengaju */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5 flex items-center gap-2">
              <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Data Nama Pengajuan 
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaPengaju"
                  value={form.namaPengaju}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.namaPengaju ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.namaPengaju && <p className="text-red-500 text-xs mt-1">{errors.namaPengaju}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={form.jabatan}
                  onChange={handleChange}
                  placeholder="Masukkan Jabatan"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.jabatan ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit / Departemen <span className="text-red-500">*</span>
                </label>
                <select
                  name="unitDepartemen"
                  value={form.unitDepartemen}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${errors.unitDepartemen ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">-- Pilih Unit/Departemen --</option>
                  {unitDepartemenList.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {errors.unitDepartemen && <p className="text-red-500 text-xs mt-1">{errors.unitDepartemen}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select
                  name="prioritas"
                  value={form.prioritas}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="rendah">Rendah</option>
                  <option value="sedang">Sedang</option>
                  <option value="tinggi">Tinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detail Barang */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5 flex items-center gap-2">
              <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Detail Barang yang Diadakan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenisBarang"
                  value={form.jenisBarang}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${errors.jenisBarang ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">-- Pilih Jenis Barang --</option>
                  {jenisBarangList.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                {errors.jenisBarang && <p className="text-red-500 text-xs mt-1">{errors.jenisBarang}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah"
                    value={form.jumlah}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="satuan"
                    value={form.satuan}
                    onChange={handleChange}
                    placeholder="Unit / Buah"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.satuan ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.satuan && <p className="text-red-500 text-xs mt-1">{errors.satuan}</p>}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama & Spesifikasi Barang <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="spesifikasi"
                  value={form.spesifikasi}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tuliskan spesifikasi baranng lengkap"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${errors.spesifikasi ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.spesifikasi && <p className="text-red-500 text-xs mt-1">{errors.spesifikasi}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto / Dokumen Pendukung <span className="text-gray-400 font-normal text-xs">(opsional)</span></label>
                {foto.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {foto.map((f) => (
                      <div key={f.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFoto(f.id)}
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                          <X size={16} className="text-white opacity-0 group-hover:opacity-100 transition" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 transition cursor-pointer w-fit">
                  <ImageIcon size={15} className="text-gray-400" />
                  <span className="text-sm text-gray-500 font-medium">Tambah foto pendukung</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFotoChange} />
                </label>
              </div>
            </div>
          </div>

          {/* Anggaran */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5 flex items-center gap-2">
              <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Anggaran &amp; Sumber Dana
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimasi Harga per Satuan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="estimasiHarga"
                  value={form.estimasiHarga}
                  onChange={handleChange}
                  placeholder="Masukkan Harga Estimasi"
                  min={0}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.estimasiHarga ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.estimasiHarga && <p className="text-red-500 text-xs mt-1">{errors.estimasiHarga}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumber Dana <span className="text-red-500">*</span>
                </label>
                <select
                  name="sumberDana"
                  value={form.sumberDana}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${errors.sumberDana ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">-- Pilih Sumber Dana --</option>
                  {sumberDanaList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.sumberDana && <p className="text-red-500 text-xs mt-1">{errors.sumberDana}</p>}
              </div>
              {totalEstimasi > 0 && (
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Estimasi Anggaran</p>
                  <p className="text-2xl font-extrabold text-[#003580]">{formatRupiah(totalEstimasi)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.jumlah} {form.satuan || "unit"} × {formatRupiah(parseInt(form.estimasiHarga) || 0)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Keterangan */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="font-bold text-[#003580] text-base mb-5 flex items-center gap-2">
              <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">4</span>
              Keterangan
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tujuan &amp; Alasan Pengadaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="tujuanPengadaan"
                  value={form.tujuanPengadaan}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Berikan Alasan Tujuan pengadaan barang"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${errors.tujuanPengadaan ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.tujuanPengadaan && <p className="text-red-500 text-xs mt-1">{errors.tujuanPengadaan}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Tambahan (opsional)
                </label>
                <textarea
                  name="catatanPengaju"
                  value={form.catatanPengaju}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Informasi tambahan untuk tim pengadaan"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 pb-8">
            <button type="button" onClick={handleReset}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-orange-300 bg-orange-50 text-orange-600 font-semibold text-sm hover:bg-orange-100 hover:border-orange-400 transition min-w-[160px]">
              <RotateCcw size={15} /> Reset Form
            </button>
            <button type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-w-[160px]"
              style={{ background: "linear-gradient(135deg, #003580 0%, #0047AB 100%)" }}>
              <Send size={15} /> Ajukan Pengadaan
            </button>
          </div>
        </form>
      </main>
    </ProtectedPage>
  );
}
