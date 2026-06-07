import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-auto bg-white" style={{ borderTop: "1px solid #e5e7eb" }}>
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row md:justify-between gap-8">
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
            Sistem Informasi Pemesanan dan Pengadaan Barang Internal SMK Dua Mei
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-bold text-blue-700 mb-3 text-xs uppercase tracking-widest">Kontak</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Jl. H.Abdul Gani No.135 Ciputat Tangerang, Kec. Ciputat Timur</li>
            <li>Kota Tangerang Selatan, Banten </li>
            <li>duameismk135@yahoo.co.id</li>
            <li>(021) 7490034</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} SMK Dua Mei — Yayasan Pendidikan Dua Mei
      </div>
    </footer>
  );
}
