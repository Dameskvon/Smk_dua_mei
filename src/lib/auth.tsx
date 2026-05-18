"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "guru" | "kepala_sekolah" | "admin" | "admin_it";

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const roleLabel: Record<UserRole, string> = {
  guru: "Guru",
  kepala_sekolah: "Kepala Sekolah",
  admin: "Admin TU",
  admin_it: "Admin IT",
};

export const roleColor: Record<UserRole, string> = {
  guru: "bg-blue-100 text-blue-700",
  kepala_sekolah: "bg-indigo-100 text-indigo-700",
  admin: "bg-violet-100 text-violet-700",
  admin_it: "bg-purple-100 text-purple-700",
};

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
  admin_it: [
    { href: "/", label: "Beranda" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pemesanan", label: "Pemesanan" },
    { href: "/pengadaan", label: "Pengadaan" },
    { href: "/approval", label: "Persetujuan" },
    { href: "/stok", label: "Stok" },
    { href: "/laporan", label: "Laporan" },
    { href: "/kelola-akun", label: "Kelola Akun" },
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
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem("smk_user"); }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const userData: User = await res.json();
      setUser(userData);
      localStorage.setItem("smk_user", JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
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

// Helper: fetch dengan Authorization header otomatis dari localStorage
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const saved = typeof window !== "undefined" ? localStorage.getItem("smk_user") : null;
  const token = saved ? Buffer.from(saved).toString("base64") : "";
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
