"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, roleLabel, roleColor, roleNavLinks } from "@/lib/auth";
import { LogOut, User, ChevronDown } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = user ? roleNavLinks[user.role] : [
    { href: "/", label: "Beranda" },
    { href: "/pemesanan", label: "Pemesanan Barang" },
    { href: "/pengadaan", label: "Pengadaan Barang" },
    { href: "/riwayat", label: "Riwayat" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-[#003580] shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#FFD700] py-1">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-[#003580] font-semibold">
          <span>Yayasan Pendidikan Dua Mei</span>
          <span>Jl. Raya Dua Mei No. 1 — smkduamei@edu.id</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center font-black text-[#003580] text-sm shadow">
              SMK
            </div>
            <div className="text-white">
              <p className="font-bold text-sm leading-tight">SMK DUA MEI</p>
              <p className="text-xs text-blue-200 leading-tight">Sistem Pengadaan Internal</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[#FFD700] text-[#003580]"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: user info or login */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition"
                >
                  <div className="w-7 h-7 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <User size={14} className="text-[#003580]" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-semibold leading-tight max-w-[120px] truncate">{user.nama.split(",")[0]}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${roleColor[user.role]}`}>
                      {roleLabel[user.role]}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-blue-200" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user.nama}</p>
                      <p className="text-xs text-gray-500">{user.jabatan}</p>
                      <p className="text-xs text-gray-400">{user.unitDepartemen}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition mt-1"
                    >
                      <LogOut size={14} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#FFD700] text-[#003580] text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition shadow"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-6 flex flex-col gap-1">
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[#FFD700] text-[#003580]"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="border-t border-blue-700 mt-2 pt-2 px-4">
                  <p className="text-white text-xs font-semibold">{user.nama}</p>
                  <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold mt-0.5 ${roleColor[user.role]}`}>
                    {roleLabel[user.role]}
                  </span>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:text-red-200 mt-1"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mx-4 mt-2 bg-[#FFD700] text-[#003580] text-sm font-bold px-4 py-2 rounded-lg text-center"
              >
                Masuk
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
}
