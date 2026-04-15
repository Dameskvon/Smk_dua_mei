"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "guru" | "kepala_sekolah" | "admin";

export interface User {
  id: string;
  nama: string;
  jabatan: string;
  unitDepartemen: string;
  role: UserRole;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const demoUsers: Array<User & { password: string }> = [
  {
    id: "u1",
    username: "guru1",
    password: "guru123",
    nama: "Budi Santoso, S.Pd.",
    jabatan: "Guru Matematika",
    unitDepartemen: "Jurusan MIPA",
    role: "guru",
  },
  {
    id: "u2",
    username: "guru2",
    password: "guru123",
    nama: "Siti Rahayu, S.Pd.",
    jabatan: "Guru Bahasa Indonesia",
    unitDepartemen: "Jurusan Bahasa",
    role: "guru",
  },
  {
    id: "u3",
    username: "kepsek",
    password: "kepsek123",
    nama: "Drs. H. Ahmad Fauzi, M.Pd.",
    jabatan: "Kepala Sekolah",
    unitDepartemen: "Pimpinan",
    role: "kepala_sekolah",
  },
  {
    id: "u4",
    username: "admin",
    password: "admin123",
    nama: "Dewi Lestari, S.E.",
    jabatan: "Staff Tata Usaha",
    unitDepartemen: "Tata Usaha",
    role: "admin",
  },
];

export const roleLabel: Record<UserRole, string> = {
  guru: "Guru",
  kepala_sekolah: "Kepala Sekolah",
  admin: "Admin TU",
};

export const roleColor: Record<UserRole, string> = {
  guru: "bg-blue-100 text-blue-700",
  kepala_sekolah: "bg-purple-100 text-purple-700",
  admin: "bg-green-100 text-green-700",
};

// Nav links per role
export const roleNavLinks: Record<UserRole, { href: string; label: string }[]> = {
  guru: [
    { href: "/", label: "Beranda" },
    { href: "/pemesanan", label: "Pemesanan Barang" },
    { href: "/pengadaan", label: "Pengadaan Barang" },
    { href: "/riwayat", label: "Riwayat" },
    { href: "/katalog", label: "Katalog" },
    { href: "/notifikasi", label: "Notifikasi" },
  ],
  kepala_sekolah: [
    { href: "/", label: "Beranda" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/approval", label: "Persetujuan" },
    { href: "/laporan", label: "Laporan" },
    { href: "/riwayat", label: "Riwayat" },
    { href: "/notifikasi", label: "Notifikasi" },
  ],
  admin: [
    { href: "/", label: "Beranda" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pemesanan", label: "Pemesanan" },
    { href: "/pengadaan", label: "Pengadaan" },
    { href: "/approval", label: "Persetujuan" },
    { href: "/stok", label: "Stok" },
    { href: "/laporan", label: "Laporan" },
    { href: "/riwayat", label: "Riwayat" },
    { href: "/notifikasi", label: "Notifikasi" },
  ],
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("smk_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("smk_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const found = demoUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return false;
    const { password: _pw, ...userData } = found;
    void _pw;
    setUser(userData);
    localStorage.setItem("smk_user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smk_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
