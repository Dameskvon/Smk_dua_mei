"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, roleLabel, roleColor, roleNavLinks } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useAppState } from "@/lib/appState";
import {
  Home, ClipboardList, Tag, Clock, Package, Bell,
  BarChart3, ShieldCheck, FileText, Store, LogOut, X,
  Sun, Moon, Users, AlertCircle, ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "/":            <Home size={17} />,
  "/pemesanan":   <ClipboardList size={17} />,
  "/pengadaan":   <Tag size={17} />,
  "/riwayat":     <Clock size={17} />,
  "/katalog":     <Package size={17} />,
  "/notifikasi":  <Bell size={17} />,
  "/dashboard":   <BarChart3 size={17} />,
  "/approval":    <ShieldCheck size={17} />,
  "/laporan":     <FileText size={17} />,
  "/stok":        <Store size={17} />,
  "/kelola-akun": <Users size={17} />,
};

function getInitials(nama: string) {
  return nama
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { notifikasiList } = useAppState();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navLinks = user ? roleNavLinks[user.role] : [{ href: "/", label: "Beranda" }];

  const unreadCount = notifikasiList.filter((n) => {
    if (!n.sudahDibaca) {
      if (!user) return n.targetRole === "semua";
      if (user.role === "guru") return n.targetRole === "pemohon" || n.targetRole === "semua";
      if (user.role === "kepala_sekolah") return n.targetRole === "kepala_sekolah" || n.targetRole === "admin" || n.targetRole === "semua";
      return n.targetRole === "admin" || n.targetRole === "semua";
    }
    return false;
  }).length;

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 flex flex-col z-40
          shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
        `}
        style={{ background: "linear-gradient(180deg, #002a6b 0%, #003580 40%, #002d70 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[#003580] text-xs shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFC200 100%)" }}>
              SMK
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight tracking-tight">SMK DUA MEI</p>
              <p className="text-blue-300/80 text-[10px] leading-tight font-medium">Pengadaan Internal</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-blue-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
            <X size={17} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-white/10 mx-3 mt-3 mb-1 rounded-xl bg-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-[#003580] shadow"
                style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFC200 100%)" }}>
                {getInitials(user.nama)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-bold truncate">{user.nama.split(",")[0]}</p>
                <p className="text-blue-300/80 text-[10px] truncate">{user.jabatan}</p>
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-bold mt-1 ${roleColor[user.role]}`}>
                  {roleLabel[user.role]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="text-blue-400/70 text-[10px] font-bold uppercase tracking-widest px-2 mb-2 mt-1">Navigasi</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isNotif = link.href === "/notifikasi";
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "text-[#003580] shadow-lg"
                    : "text-blue-100/90 hover:bg-white/10 hover:text-white"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #FFD700 0%, #FFC200 100%)" } : {}}
              >
                {/* Active left bar */}
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FFD700] rounded-r-full" />
                )}

                <span className={isActive ? "text-[#003580]" : "text-blue-300/80 group-hover:text-white transition"}>
                  {iconMap[link.href] ?? <Home size={17} />}
                </span>

                <span className="flex-1">{link.label}</span>

                {/* Notification badge */}
                {isNotif && unreadCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    isActive ? "bg-[#003580] text-[#FFD700]" : "bg-red-500 text-white"
                  }`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                {isActive && <ChevronRight size={14} className="text-[#003580]/60 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200/90 hover:bg-white/10 hover:text-white transition-all"
          >
            {theme === "dark" ? (
              <><Sun size={17} className="text-yellow-300" />Mode Terang</>
            ) : (
              <><Moon size={17} className="text-blue-300" />Mode Gelap</>
            )}
          </button>

          {/* Logout */}
          {user ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-300/90 hover:bg-red-500/15 hover:text-red-200 transition-all"
            >
              <LogOut size={17} />
              Keluar dari Sistem
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-[#003580]"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFC200 100%)" }}
            >
              Masuk
            </Link>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-80 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm">Konfirmasi Keluar</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sesi Anda akan diakhiri</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
              Anda akan diarahkan ke halaman login. Pastikan semua pekerjaan sudah tersimpan.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition"
              >
                Tetap Di Sini
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
