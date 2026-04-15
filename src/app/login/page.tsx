import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleLabel, roleColor } from "@/lib/auth";
import { Eye, EyeOff, LogIn, GraduationCap } from "lucide-react";

const demoAccounts = [
  { username: "guru1", password: "guru123", role: "guru" as const, nama: "Budi Santoso" },
  { username: "guru2", password: "guru123", role: "guru" as const, nama: "Siti Rahayu" },
  { username: "kepsek", password: "kepsek123", role: "kepala_sekolah" as const, nama: "Drs. H. Ahmad Fauzi" },
  { username: "admin", password: "admin123", role: "admin" as const, nama: "Dewi Lestari" },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        router.replace("/");
      } else {
        setError("Username atau password salah.");
      }
      setLoading(false);
    }, 500);
  };

  const fillDemo = (acc: (typeof demoAccounts)[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003580] via-[#0047AB] to-[#003580] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] rounded-full shadow-lg mb-4">
            <GraduationCap size={32} className="text-[#003580]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">SMK DUA MEI</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Pemesanan & Pengadaan Barang</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-[#003580] mb-1">Masuk ke Akun</h2>
          <p className="text-gray-500 text-sm mb-6">Gunakan akun yang diberikan oleh admin sekolah.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] focus:border-transparent"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] focus:border-transparent"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003580] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-3">Akun Demo — Klik untuk mengisi</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => fillDemo(acc)}
                className="text-left bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2.5 transition"
              >
                <p className="text-white text-xs font-bold truncate">{acc.nama}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold mt-1 ${roleColor[acc.role]}`}>
                  {roleLabel[acc.role]}
                </span>
                <p className="text-blue-300 text-xs mt-0.5 font-mono">{acc.username} / {acc.password}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
