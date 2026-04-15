import Link from "next/link";
import { getDashboardStats } from "@/lib/data";
import { ClipboardList, Tag, Search, BarChart3, FileText, Send, ShieldCheck, UserCheck, PackageCheck } from "lucide-react";

export default function HomePage() {
  const stats = getDashboardStats();

  const fiturList = [
    {
      icon: <ClipboardList size={32} className="text-blue-600" />,
      title: "Form Pemesanan Barang",
      desc: "Ajukan permintaan barang kebutuhan operasional harian sekolah secara mudah dan terstruktur.",
      href: "/pemesanan",
      color: "border-blue-400",
      bg: "bg-blue-50",
    },
    {
      icon: <Tag size={32} className="text-yellow-600" />,
      title: "Form Pengadaan Barang",
      desc: "Ajukan pengadaan barang baru dengan estimasi anggaran dan spesifikasi lengkap.",
      href: "/pengadaan",
      color: "border-yellow-400",
      bg: "bg-yellow-50",
    },
    {
      icon: <Search size={32} className="text-green-600" />,
      title: "Riwayat & Tracking",
      desc: "Pantau status pemesanan dan pengadaan barang secara real-time.",
      href: "/riwayat",
      color: "border-green-400",
      bg: "bg-green-50",
    },
    {
      icon: <BarChart3 size={32} className="text-purple-600" />,
      title: "Dashboard Admin",
      desc: "Ringkasan statistik dan rekap seluruh kegiatan pemesanan dan pengadaan.",
      href: "/dashboard",
      color: "border-purple-400",
      bg: "bg-purple-50",
    },
  ];

  const prosedurList = [
    { step: "01", title: "Isi Formulir", desc: "Lengkapi data diri, unit, dan daftar barang yang dibutuhkan.", icon: <FileText size={20} className="text-white" /> },
    { step: "02", title: "Kirim Permintaan", desc: "Submit formulir dan dapatkan nomor referensi otomatis.", icon: <Send size={20} className="text-white" /> },
    { step: "03", title: "Verifikasi Admin", desc: "Tim pengadaan memverifikasi dan memproses permintaan.", icon: <ShieldCheck size={20} className="text-white" /> },
    { step: "04", title: "Persetujuan", desc: "Kepala sekolah atau pejabat berwenang memberikan persetujuan.", icon: <UserCheck size={20} className="text-white" /> },
    { step: "05", title: "Selesai", desc: "Barang disiapkan dan diserahkan sesuai jadwal yang ditentukan.", icon: <PackageCheck size={20} className="text-white" /> },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003580] via-[#0056D2] to-[#1E90FF] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#003580] text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow">
            SISTEM INFORMASI INTERNAL
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Sistem Pemesanan &amp; Pengadaan Barang
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-[#FFD700] mb-2">
            SMK DUA MEI — Yayasan Pendidikan Dua Mei
          </p>
          <p className="text-blue-200 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Platform digital terintegrasi untuk pengelolaan permintaan dan pengadaan barang kebutuhan
            internal sekolah secara efisien, transparan, dan terstruktur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pemesanan"
              className="bg-[#FFD700] text-[#003580] font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-yellow-300 transition text-sm"
            >
              Buat Pemesanan Barang
            </Link>
            <Link
              href="/pengadaan"
              className="bg-white text-[#003580] font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-50 transition text-sm"
            >
              Ajukan Pengadaan Barang
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Total Pemesanan", value: stats.totalPemesanan, color: "text-blue-600" },
            { label: "Total Pengadaan", value: stats.totalPengadaan, color: "text-yellow-600" },
            { label: "Menunggu Proses", value: stats.menungguPersetujuan, color: "text-orange-500" },
            { label: "Selesai / Disetujui", value: stats.selesai, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="p-3">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fitur */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#003580] mb-2">Layanan Kami</h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Akses semua layanan pengadaan internal dengan mudah
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fiturList.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className={`group p-6 rounded-xl border-l-4 ${f.color} ${f.bg} shadow hover:shadow-md transition`}
              >
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#003580] text-base mb-2 group-hover:underline">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Prosedur */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#003580] mb-2">Alur Pengajuan</h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Proses sederhana, transparan, dan mudah dipantau
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {prosedurList.map((p, i) => (
              <div key={p.step} className="relative text-center">
                {i < prosedurList.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-200 z-0" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#003580] text-white font-bold text-sm mb-3 shadow">
                  {p.icon}
                </div>
                <h4 className="font-semibold text-[#003580] text-sm mb-1">{p.title}</h4>
                <p className="text-gray-500 text-xs">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FFD700] py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#003580] mb-3">
            Butuh Barang untuk Kegiatan Sekolah?
          </h2>
          <p className="text-[#003580] text-sm mb-6 opacity-80">
            Ajukan permintaan sekarang dan tim pengadaan kami akan segera memprosesnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pemesanan"
              className="bg-[#003580] text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-900 transition text-sm shadow"
            >
              Mulai Pemesanan
            </Link>
            <Link
              href="/riwayat"
              className="bg-white text-[#003580] font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition text-sm shadow"
            >
              Cek Status Pesanan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
