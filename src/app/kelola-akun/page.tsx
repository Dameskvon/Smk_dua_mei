"use client";

import { useState, useEffect } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { UserRole, roleLabel, roleColor } from "@/lib/auth";
import {
  Users, Plus, Pencil, Trash2, X, Save, Search,
  CheckCircle2, ShieldCheck, User,
} from "lucide-react";

interface AkunUser {
  id: string;
  nama: string;
  username: string;
  jabatan: string;
  unitDepartemen: string;
  role: UserRole;
  aktif: boolean;
}

const emptyForm = (): Omit<AkunUser, "id"> => ({
  nama: "", username: "", jabatan: "", unitDepartemen: "", role: "guru", aktif: true,
});

const unitList = [
  "Pimpinan", "Tata Usaha", "IT & Teknologi", "Sarana Prasarana", "Kurikulum",
  "Kesiswaan", "Humas", "Jurusan TKJ", "Jurusan RPL", "Jurusan AKL",
  "Jurusan OTKP", "Jurusan BDP", "Jurusan MIPA", "Jurusan Bahasa",
  "Perpustakaan", "UKS", "BK", "Lab Komputer", "Lab IPA",
];

export default function KelolaAkunPage() {
  const [akun, setAkun] = useState<AkunUser[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "semua">("semua");
  const [modalMode, setModalMode] = useState<"tambah" | "ubah" | "hapus" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setAkun(data.map((u: Omit<AkunUser, "aktif">) => ({ ...u, aktif: true }))))
      .catch(() => {});
  }, []);

  const filtered = akun.filter((u) => {
    const matchSearch = !search || u.nama.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "semua" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openTambah = () => { setForm(emptyForm()); setErrors({}); setSelectedId(null); setModalMode("tambah"); };
  const openUbah = (u: AkunUser) => { const { id, ...rest } = u; setSelectedId(id); setForm(rest); setErrors({}); setModalMode("ubah"); };
  const openHapus = (id: string) => { setSelectedId(id); setModalMode("hapus"); };
  const closeModal = () => { setModalMode(null); setSelectedId(null); setErrors({}); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = "Nama wajib diisi";
    if (!form.username.trim()) e.username = "Username wajib diisi";
    if (!form.jabatan.trim()) e.jabatan = "Jabatan wajib diisi";
    if (!form.unitDepartemen) e.unitDepartemen = "Unit/Departemen wajib dipilih";
    if (modalMode === "tambah" && akun.find((u) => u.username === form.username.trim())) {
      e.username = "Username sudah digunakan";
    }
    return e;
  };

  const handleSimpan = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (modalMode === "tambah") {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: form.nama.trim(), username: form.username.trim(), jabatan: form.jabatan.trim(), unitDepartemen: form.unitDepartemen, role: form.role }),
      });
      const newUser = await res.json();
      setAkun((prev) => [...prev, { ...newUser, aktif: true }]);
      setSuccessMsg(`Akun "${newUser.nama}" berhasil ditambahkan.`);
    } else if (modalMode === "ubah" && selectedId) {
      const res = await fetch(`/api/users/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: form.nama.trim(), jabatan: form.jabatan.trim(), unitDepartemen: form.unitDepartemen, role: form.role }),
      });
      const updated = await res.json();
      setAkun((prev) => prev.map((u) => u.id === selectedId ? { ...u, ...updated, aktif: u.aktif } : u));
      setSuccessMsg(`Akun "${form.nama}" berhasil diperbarui.`);
    }

    closeModal();
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleHapus = async () => {
    const target = akun.find((u) => u.id === selectedId);
    await fetch(`/api/users/${selectedId}`, { method: "DELETE" });
    setAkun((prev) => prev.filter((u) => u.id !== selectedId));
    setSuccessMsg(`Akun "${target?.nama}" berhasil dihapus.`);
    closeModal();
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const toggleAktif = (id: string) => {
    setAkun((prev) => prev.map((u) => u.id === id ? { ...u, aktif: !u.aktif } : u));
  };

  const roleCounts = (["guru", "kepala_sekolah", "admin", "admin_it"] as UserRole[]).map((r) => ({
    role: r, count: akun.filter((u) => u.role === r).length,
  }));

  return (
    <ProtectedPage allowedRoles={["admin_it"]}>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-[#003580]">Beranda</a>
            <span>/</span>
            <span className="text-[#003580] font-semibold">Kelola Akun & Hak Akses</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-[#003580] flex items-center gap-2">
                <Users size={24} /> Kelola Akun & Hak Akses
              </h1>
              <p className="text-gray-500 text-sm mt-1">Kelola data pengguna, role, dan hak akses sistem.</p>
            </div>
            <button onClick={openTambah} className="flex items-center gap-2 px-4 py-2.5 bg-[#003580] hover:bg-blue-900 text-white text-sm font-semibold rounded-xl transition">
              <Plus size={16} /> Tambah Akun
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {roleCounts.map(({ role, count }) => (
            <div key={role} onClick={() => setFilterRole(filterRole === role ? "semua" : role)}
              className={`border rounded-xl p-3 text-center cursor-pointer transition hover:shadow ${filterRole === role ? "ring-2 ring-blue-400 bg-blue-50" : "bg-white"}`}>
              <p className="text-2xl font-extrabold text-[#003580]">{count}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor[role]}`}>{roleLabel[role]}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama atau username..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <User size={14} className="text-[#003580]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.nama}</p>
                        <p className="text-xs text-gray-400 font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="text-gray-700">{u.jabatan}</p><p className="text-xs text-gray-400">{u.unitDepartemen}</p></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor[u.role]}`}>
                      <ShieldCheck size={11} /> {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAktif(u.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition ${u.aktif ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {u.aktif ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openUbah(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => openHapus(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Tidak ada akun ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {(modalMode === "tambah" || modalMode === "ubah") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-bold text-[#003580] text-base">{modalMode === "tambah" ? "Tambah Akun Baru" : "Edit Akun"}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                  <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.nama ? "border-red-400" : "border-gray-300"}`}
                    placeholder="Contoh: Budi Santoso, S.Pd." />
                  {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username *</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    disabled={modalMode === "ubah"}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400 ${errors.username ? "border-red-400" : "border-gray-300"}`}
                    placeholder="Contoh: budi.santoso" />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                  {modalMode === "tambah" && <p className="text-xs text-gray-400 mt-1">Password awal = username</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan *</label>
                  <input type="text" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.jabatan ? "border-red-400" : "border-gray-300"}`}
                    placeholder="Contoh: Guru Matematika" />
                  {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit / Departemen *</label>
                  <select value={form.unitDepartemen} onChange={(e) => setForm({ ...form, unitDepartemen: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.unitDepartemen ? "border-red-400" : "border-gray-300"}`}>
                    <option value="">-- Pilih Unit --</option>
                    {unitList.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  {errors.unitDepartemen && <p className="text-red-500 text-xs mt-1">{errors.unitDepartemen}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Hak Akses (Role) *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["guru", "kepala_sekolah", "admin", "admin_it"] as UserRole[]).map((r) => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition text-left ${form.role === r ? "border-[#003580] bg-blue-50 text-[#003580]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs ${roleColor[r]}`}>{roleLabel[r]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-3 justify-end">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Batal</button>
                <button onClick={handleSimpan} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#003580] hover:bg-blue-900 rounded-lg transition">
                  <Save size={14} /> Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {modalMode === "hapus" && selectedId && (() => {
          const target = akun.find((u) => u.id === selectedId);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-80">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 size={18} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Hapus Akun</h3>
                      <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-5">Apakah Anda yakin ingin menghapus akun <strong>{target?.nama}</strong>?</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Batal</button>
                    <button onClick={handleHapus} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition">Hapus</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </main>
    </ProtectedPage>
  );
}
