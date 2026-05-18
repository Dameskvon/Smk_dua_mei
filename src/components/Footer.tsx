import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-auto bg-white" style={{ borderTop: "1px solid #e5e7eb" }}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Logo size={48} className="shrink-0 drop-shadow-lg" />
            <div>
              <p className="font-extrabold text-sm tracking-wide text-blue-900">SMK DUA MEI</p>
              <p className="text-xs text-blue-500">Yayasan Pendidikan Dua Mei</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sistem Informasi Pemesanan dan Pengadaan Barang Internal SMK Dua Mei.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-blue-700 mb-3 text-xs uppercase tracking-widest">Akses Cepat</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="/pemesanan" className="hover:text-blue-700 transition">Form Pemesanan Barang</a></li>
            <li><a href="/pengadaan" className="hover:text-blue-700 transition">Form Pengadaan Barang</a></li>
            <li><a href="/riwayat" className="hover:text-blue-700 transition">Riwayat Pesanan</a></li>
            <li><a href="/dashboard" className="hover:text-blue-700 transition">Dashboard Admin</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-blue-700 mb-3 text-xs uppercase tracking-widest">Kontak</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Jl. Raya Dua Mei No. 1</li>
            <li>Jakarta Selatan, DKI Jakarta</li>
            <li>smkduamei@edu.id</li>
            <li>(021) 123-4567</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} SMK Dua Mei — Yayasan Pendidikan Dua Mei
      </div>
    </footer>
  );
}
