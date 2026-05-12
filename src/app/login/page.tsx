"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleLabel, roleColor } from "@/lib/auth";
import { Eye, EyeOff, LogIn, GraduationCap, ShieldCheck, User, Lock } from "lucide-react";

const demoAccounts = [
  { username: "guru1",   password: "guru123",   role: "guru"           as const, nama: "Budi Santoso, S.Pd." },
  { username: "kepsek",  password: "kepsek123", role: "kepala_sekolah" as const, nama: "Drs. H. Ahmad Fauzi" },
  { username: "admin",   password: "admin123",  role: "admin"          as const, nama: "Dewi Lestari, S.E." },
  { username: "adminit", password: "adminit123",role: "admin_it"       as const, nama: "Reza Firmansyah, S.Kom." },
];

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
    else { setError("Username atau password salah. Periksa kembali kredensial Anda."); }
    setLoading(false);
  };

  const fillDemo = (acc: (typeof demoAccounts)[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-[#001f5b]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#003580]/60 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#0047AB]/40 blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#FFD700]/5 blur-3xl animate-spin-slow" />

        {/* Floating grid dots */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header branding */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-4 relative"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}>
            <GraduationCap size={38} className="text-[#003580]" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#001f5b] flex items-center justify-center">
              <ShieldCheck size={10} className="text-white" />
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SMK DUA MEI</h1>
          <p className="text-blue-300 text-sm mt-1.5 font-medium">Sistem Pemesanan &amp; Pengadaan Barang</p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-slide-up delay-75">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-white">Selamat Datang 👋</h2>
            <p className="text-blue-300 text-sm mt-1">Masuk menggunakan akun yang diberikan administrator.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60 focus:border-[#FFD700]/40 transition"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300">
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-400 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60 focus:border-[#FFD700]/40 transition"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm rounded-xl px-4 py-3 flex items-start gap-2 animate-slide-down">
                <span className="mt-0.5 shrink-0">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 text-[#003580] shadow-lg text-sm mt-2"
              style={{ background: loading ? "#FFD700aa" : "linear-gradient(135deg, #FFD700 0%, #FFC200 100%)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#003580] border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-5 animate-slide-up delay-150">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest text-center mb-3">
            ⚡ Akun Demo — Klik untuk mengisi otomatis
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => fillDemo(acc)}
                className="text-left bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-2xl px-3.5 py-3 transition group"
              >
                <p className="text-white text-xs font-bold truncate group-hover:text-[#FFD700] transition">{acc.nama}</p>
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-bold mt-1 ${roleColor[acc.role]}`}>
                  {roleLabel[acc.role]}
                </span>
                <p className="text-blue-400 text-[10px] mt-1 font-mono opacity-80 group-hover:opacity-100 transition">
                  {acc.username} / {acc.password}
                </p>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-blue-500/60 text-xs mt-6">
          © 2025 SMK Dua Mei · Sistem Internal
        </p>
      </div>
    </main>
  );
}
