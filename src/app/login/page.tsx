"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { Eye, EyeOff, LogIn, User, Lock, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username.trim(), password);
    if (ok) { router.replace("/"); }
    else { setError("Username atau password salah. Silahkan periksa kembali Username dan Password Anda."); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-white">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#003580]/[0.03] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#0047AB]/[0.03] blur-3xl" />

        {/* Subtle grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#003580" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header branding with logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
            <Image
              src="/logo.png"
              alt="Logo SMK Dua Mei"
              width={120}
              height={120}
              priority
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-[#003580] tracking-tight">SMK DUA MEI</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">Sistem Pemesanan &amp; Pengadaan Barang</p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl shadow-gray-200/50 p-8 animate-slide-up delay-75">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 text-center">
              Selamat Datang
            </h2>
            <p className="text-gray-500 text-sm mt-1">Mohon masukkan Username & Password dengan Benar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]/50 transition"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]/50 transition"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2 animate-slide-down">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 text-white shadow-lg shadow-[#003580]/20 text-sm mt-2 cursor-pointer hover:shadow-xl hover:shadow-[#003580]/30"
              style={{ background: loading ? "#003580cc" : "linear-gradient(135deg, #003580 0%, #0047AB 100%)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © 2026 SMK Dua Mei · Yayasan Pendidikan Dua Mei
        </p>
      </div>
    </main>
  );
}
