"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, roleLabel, roleColor, roleNavLinks } from "@/lib/auth";
import {
  Home, ClipboardList, Tag, Clock, Package, Bell,
  BarChart3, ShieldCheck, FileText, Store, LogOut, User, Menu, X,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "/":            <Home size={18} />,
  "/pemesanan":   <ClipboardList size={18} />,
  "/pengadaan":   <Tag size={18} />,
  "/riwayat":     <Clock size={18} />,
  "/katalog":     <Package size={18} />,
  "/notifikasi":  <Bell size={18} />,
  "/dashboard":   <BarChart3 size={18} />,
  "/approval":    <ShieldCheck size={18} />,
  "/laporan":     <FileText size={18} />,
  "/stok":        <Store size={18} />,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navLinks = user ? roleNavLinks[user.role] : [
    { href: "/", label: "Beranda" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#003580] flex flex-col z-40
          shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-blue-700">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-9 h-9 bg-[#FFD700] rounded-full flex items-center justify-center font-black text-[#003580] text-xs shadow shrink-0">
              SMK
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">SMK DUA MEI</p>
              <p className="text-blue-300 text-xs leading-tight">Pengadaan Internal</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-blue-300 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-5 py-4 border-b border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FFD700] rounded-full flex items-center justify-center shrink-0">
                <User size={16} className="text-[#003580]" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{user.nama.split(",")[0]}</p>
                <p className="text-blue-300 text-xs truncate">{user.jabatan}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold mt-0.5 ${roleColor[user.role]}`}>
                  {roleLabel[user.role]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider px-2 mb-3">Menu</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFD700] text-[#003580]"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-[#003580]" : "text-blue-300"}>
                  {iconMap[link.href] ?? <Home size={18} />}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-blue-700">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all"
            >
              <LogOut size={18} />
              Keluar
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-[#FFD700] text-[#003580] font-bold justify-center"
            >
              Masuk
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
