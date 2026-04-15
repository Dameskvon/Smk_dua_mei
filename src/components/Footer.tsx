export default function Footer() {
  return (
    <footer className="bg-[#003580] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center font-black text-[#003580] text-sm shadow">
              SMK
            </div>
            <div>
              <p className="font-bold text-sm">SMK DUA MEI</p>
              <p className="text-xs text-blue-200">Yayasan Pendidikan Dua Mei</p>
            </div>
          </div>
          <p className="text-sm text-blue-200">
            Sistem Informasi Pemesanan dan Pengadaan Barang Internal SMK Dua Mei.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-[#FFD700] mb-3">Akses Cepat</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><a href="/pemesanan" className="hover:text-white transition">Form Pemesanan Barang</a></li>
            <li><a href="/pengadaan" className="hover:text-white transition">Form Pengadaan Barang</a></li>
            <li><a href="/riwayat" className="hover:text-white transition">Riwayat Pesanan</a></li>
            <li><a href="/dashboard" className="hover:text-white transition">Dashboard Admin</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-[#FFD700] mb-3">Kontak</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>Jl. Raya Dua Mei No. 1</li>
            <li>Jakarta Selatan, DKI Jakarta</li>
            <li>smkduamei@edu.id</li>
            <li>(021) 123-4567</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-blue-800 py-4 text-center text-xs text-blue-300">
        &copy; {new Date().getFullYear()} SMK Dua Mei — Yayasan Pendidikan Dua Mei. All rights reserved.
      </div>
    </footer>
  );
}
