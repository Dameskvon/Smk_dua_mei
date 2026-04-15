"use client";

import { useState } from "react";
import { unitDepartemenList } from "@/lib/data";
import { BarangItem } from "@/types";
import { CheckCircle2 } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

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

const initialBarang: BarangItem = {
  id: "",
  namaBarang: "",
  jumlah: 1,
  satuan: "",
  keterangan: "",
};

export default function PemesananPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [barangList, setBarangList] = useState<BarangItem[]>([
    { ...initialBarang, id: "1" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [nomorPesanan, setNomorPesanan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleBarangChange = (
    id: string,
    field: keyof BarangItem,
    value: string | number
  ) => {
    setBarangList(
      barangList.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const addBarang = () => {
    setBarangList([
      ...barangList,
      { ...initialBarang, id: Date.now().toString() },
    ]);
  };

  const removeBarang = (id: string) => {
    if (barangList.length === 1) return;
    setBarangList(barangList.filter((b) => b.id !== id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.namaPemesan) newErrors.namaPemesan = "Nama wajib diisi";
    if (!form.jabatan) newErrors.jabatan = "Jabatan wajib diisi";
    if (!form.unitDepartemen) newErrors.unitDepartemen = "Unit/Departemen wajib dipilih";
    if (!form.keperluan) newErrors.keperluan = "Keperluan wajib diisi";
    if (!form.tanggalDibutuhkan) newErrors.tanggalDibutuhkan = "Tanggal dibutuhkan wajib diisi";
    barangList.forEach((b, i) => {
      if (!b.namaBarang) newErrors[`barang_nama_${i}`] = "Nama barang wajib diisi";
      if (!b.satuan) newErrors[`barang_satuan_${i}`] = "Satuan wajib diisi";
      if (b.jumlah < 1) newErrors[`barang_jumlah_${i}`] = "Jumlah minimal 1";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const nomor = `PES/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`;
    setNomorPesanan(nomor);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setBarangList([{ ...initialBarang, id: "1" }]);
    setSubmitted(false);
    setNomorPesanan("");
    setErrors({});
  };

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 shadow">
          <div className="flex justify-center mb-4"><CheckCircle2 size={48} className="text-green-600" /></div>
          <h2 className="text-2xl font-extrabold text-green-700 mb-2">Pemesanan Berhasil Dikirim!</h2>
          <p className="text-gray-600 mb-4">Permintaan pemesanan barang Anda telah diterima dan sedang diproses.</p>
          <div className="bg-white border border-green-300 rounded-xl p-4 mb-6 inline-block">
            <p className="text-xs text-gray-500 mb-1">Nomor Referensi</p>
            <p className="text-xl font-mono font-bold text-[#003580]">{nomorPesanan}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">Simpan nomor referensi ini untuk memantau status pesanan Anda di halaman Riwayat.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="bg-[#003580] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-900 transition text-sm"
            >
              Buat Pemesanan Baru
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
    <ProtectedPage allowedRoles={["guru", "admin"]}>
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-[#003580]">Beranda</a>
          <span>/</span>
          <span className="text-[#003580] font-semibold">Pemesanan Barang</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#003580]">Form Pemesanan Barang Internal</h1>
        <p className="text-gray-500 text-sm mt-1">
          Isi formulir berikut untuk mengajukan pemesanan barang kebutuhan operasional SMK Dua Mei.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Data Pemesan */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h2 className="font-bold text-[#003580] text-base mb-5 flex items-center gap-2">
            <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">1</span>
            Data Pemesan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaPemesan"
                value={form.namaPemesan}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.namaPemesan ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.namaPemesan && <p className="text-red-500 text-xs mt-1">{errors.namaPemesan}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan / Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jabatan"
                value={form.jabatan}
                onChange={handleChange}
                placeholder="Contoh: Guru Produktif TKJ"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioritas
              </label>
              <select
                name="prioritas"
                value={form.prioritas}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="rendah">Rendah</option>
                <option value="sedang">Sedang</option>
                <option value="tinggi">Tinggi / Mendesak</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keperluan / Tujuan Pemesanan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="keperluan"
                value={form.keperluan}
                onChange={handleChange}
                rows={2}
                placeholder="Jelaskan keperluan pemesanan barang ini"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${errors.keperluan ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.keperluan && <p className="text-red-500 text-xs mt-1">{errors.keperluan}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Dibutuhkan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggalDibutuhkan"
                value={form.tanggalDibutuhkan}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.tanggalDibutuhkan ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.tanggalDibutuhkan && <p className="text-red-500 text-xs mt-1">{errors.tanggalDibutuhkan}</p>}
            </div>
          </div>
        </div>

        {/* Daftar Barang */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h2 className="font-bold text-[#003580] text-base mb-5 flex items-center gap-2">
            <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">2</span>
            Daftar Barang yang Dipesan
          </h2>

          <div className="space-y-4">
            {barangList.map((barang, index) => (
              <div key={barang.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#003580] bg-blue-100 px-2 py-0.5 rounded">
                    Barang #{index + 1}
                  </span>
                  {barangList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBarang(barang.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nama Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={barang.namaBarang}
                      onChange={(e) => handleBarangChange(barang.id, "namaBarang", e.target.value)}
                      placeholder="Nama barang"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors[`barang_nama_${index}`] ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors[`barang_nama_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`barang_nama_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jumlah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={barang.jumlah}
                      onChange={(e) => handleBarangChange(barang.id, "jumlah", parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={barang.satuan}
                      onChange={(e) => handleBarangChange(barang.id, "satuan", e.target.value)}
                      placeholder="Pcs / Rim / Unit"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors[`barang_satuan_${index}`] ? "border-red-400" : "border-gray-300"}`}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan (opsional)</label>
                    <input
                      type="text"
                      value={barang.keterangan || ""}
                      onChange={(e) => handleBarangChange(barang.id, "keterangan", e.target.value)}
                      placeholder="Spesifikasi tambahan, merek, warna, dll."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addBarang}
            className="mt-4 flex items-center gap-2 text-[#003580] border border-[#003580] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
          >
            <span className="text-lg leading-none">+</span> Tambah Barang
          </button>
        </div>

        {/* Catatan */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h2 className="font-bold text-[#003580] text-base mb-4 flex items-center gap-2">
            <span className="bg-[#003580] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">3</span>
            Catatan Tambahan
          </h2>
          <textarea
            name="catatanPemesan"
            value={form.catatanPemesan}
            onChange={handleChange}
            rows={3}
            placeholder="Catatan atau informasi tambahan untuk tim pengadaan (opsional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition"
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#003580] text-white font-bold rounded-lg text-sm hover:bg-blue-900 transition shadow"
          >
            Kirim Pemesanan
          </button>
        </div>
      </form>
    </main>
    </ProtectedPage>
  );
}
