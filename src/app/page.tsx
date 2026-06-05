"use client";

import Link from "next/link";
import { useAppState } from "@/lib/appState";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  ClipboardList, Tag, Search, BarChart3, FileText, Send,
  ShieldCheck, UserCheck, PackageCheck, ArrowRight,
  TrendingUp, Clock, CheckCircle2, BookOpen,
} from "lucide-react";

const bgImages = [
  "/background-1.jpeg",
  "/background-2.jpeg",
  "/background-3.jpeg",
  "/background-4.jpeg",
];

export default function HomePage() {
  const { permintaanList, pengadaanList } = useAppState();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === bgImages.length - 1) {
          setAnimated(false);
          return 0;
        }
        setAnimated(true);
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 50);
      return () => clearTimeout(t);
    }
  }, [animated]);

  const totalPemesanan      = permintaanList.length;
  const totalPengadaan      = pengadaanList.length;
  const menungguPersetujuan =
    permintaanList.filter((p) => p.status === "menunggu").length +
    pengadaanList.filter((p) => p.status === "menunggu").length;
  const selesai =
    permintaanList.filter((p) => p.status === "selesai" || p.status === "disetujui").length +
    pengadaanList.filter((p) => p.status === "selesai" || p.status === "disetujui").length;

  const fiturList = [
    {
      icon: <ClipboardList size={28} />,
      title: "Pemesanan Barang",
      desc: "Ajukan permintaan barang kebutuhan operasional harian sekolah secara mudah dan terstruktur.",
      href: "/pemesanan",
      accent: "#2563EB",
      light: "#EFF6FF",
    },
    {
      icon: <Tag size={28} />,
      title: "Pengadaan Barang",
      desc: "Ajukan pengadaan barang baru dengan estimasi anggaran dan spesifikasi lengkap.",
      href: "/pengadaan",
      accent: "#0011ffff",
      light: "#EDE9FE",
    },
    {
      icon: <Search size={28} />,
      title: "Riwayat & Tracking",
      desc: "Pantau status pemesanan dan pengadaan barang secara real-time.",
      href: "/riwayat",
      accent: "#0EA5E9",
      light: "#F0F9FF",
    },
    user?.role === "guru"
      ? {
          icon: <BookOpen size={28} />,
          title: "Katalog Barang",
          desc: "Lihat daftar barang yang tersedia di gudang beserta stok terkini.",
          href: "/katalog",
          accent: "#059669",
          light: "#ECFDF5",
        }
      : user?.role === "admin_it"
      ? {
          icon: <UserCheck size={28} />,
          title: "Kelola Akun",
          desc: "Manajemen akun pengguna sistem — tambah, ubah, dan hapus akun.",
          href: "/kelola-akun",
          accent: "#7C3AED",
          light: "#EDE9FE",
        }
      : {
          icon: <BarChart3 size={28} />,
          title: "Dashboard & Laporan",
          desc: "Ringkasan statistik dan rekap seluruh kegiatan pemesanan dan pengadaan.",
          href: "/dashboard",
          accent: "#0509ffff",
          light: "#EEF2FF",
        },
  ];

  const prosedurList = [
    { step: "01", title: "Isi Formulir",      desc: "Lengkapi data diri, unit, dan daftar barang.",              icon: <FileText size={18} /> },
    { step: "02", title: "Kirim Permintaan",  desc: "Submit dan dapatkan nomor referensi otomatis.",             icon: <Send size={18} /> },
    { step: "03", title: "Verifikasi Admin",  desc: "Tim pengadaan memverifikasi dan memproses.",                icon: <ShieldCheck size={18} /> },
    { step: "04", title: "Persetujuan",       desc: "Kepala sekolah memberikan persetujuan.",                    icon: <UserCheck size={18} /> },
    { step: "05", title: "Selesai",           desc: "Barang disiapkan dan diserahkan sesuai jadwal.",            icon: <PackageCheck size={18} /> },
  ];

  return (
    <main>
      {/* ════════════════════════════
          HERO
      ════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 480 }}>

        {/* Background slideshow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="flex h-full"
            style={{
              width: `${bgImages.length * 100}%`,
              transform: `translateX(-${(currentSlide * 100) / bgImages.length}%)`,
              transition: animated ? "transform 0.7s ease-in-out" : "none",
            }}
          >
            {bgImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-full object-cover select-none"
                style={{ width: `${100 / bgImages.length}%` }}
              />
            ))}
          </div>
          <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.55)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" alt="SMK Dua Mei" className="w-20 h-20 mb-3 drop-shadow-md" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight drop-shadow-sm" style={{ color: "#1E3A8A" }}>
            Sistem Pemesanan<br />
            <span style={{ color: "#002c8aff" }}>&amp; Pengadaan Barang</span>
          </h1>

          <p className="text-slate-1000 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform digital terintegrasi untuk pengelolaan permintaan dan pengadaan barang
            kebutuhan internal sekolah secara efisien, transparan, dan terstruktur.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pemesanan"
              className="flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-md hover:-translate-y-0.5 text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
              <ClipboardList size={16} /> Buat Pemesanan
            </Link>
            <Link href="/pengadaan"
              className="flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-xl text-sm transition border hover:-translate-y-0.5"
              style={{ borderColor: "#2563EB", color: "#1D4ED8", background: "rgba(255,255,255,0.80)" }}>
              <Tag size={16} /> Ajukan Pengadaan <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </section>

      {/* ════════════════════════════
          STATS BAR
      ════════════════════════════ */}
      <section className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Pemesanan",     value: totalPemesanan,      icon: <ClipboardList size={20} />, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Total Pengadaan",     value: totalPengadaan,      icon: <Tag size={20} />,           color: "#7C3AED", bg: "#EDE9FE" },
            { label: "Menunggu Proses",     value: menungguPersetujuan, icon: <Clock size={20} />,         color: "#D97706", bg: "#FFFBEB" },
            { label: "Selesai / Disetujui", value: selesai,             icon: <CheckCircle2 size={20} />,  color: "#059669", bg: "#ECFDF5" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: s.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "22", color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-tight" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════
          FITUR
      ════════════════════════════ */}
      <section className="py-16 px-4" style={{ background: "#F0F4FF" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">LAYANAN</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">Layanan Kami</h2>
            <p className="text-slate-500 text-sm">Akses semua layanan pengadaan internal dengan mudah</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fiturList.map((f) => (
              <Link key={f.title} href={f.href}
                className="group bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition hover:-translate-y-1 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition group-hover:scale-110"
                  style={{ background: f.light, color: f.accent }}>
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1">
                    {f.title}
                    <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition ml-1" style={{ color: f.accent }} />
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          ALUR PENGAJUAN
      ════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">PROSEDUR</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">Alur Pengajuan</h2>
            <p className="text-slate-500 text-sm">Proses sederhana, transparan, dan mudah dipantau</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {prosedurList.map((p, i) => (
              <div key={p.step} className="relative text-center">
                {i < prosedurList.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px z-0"
                    style={{ background: "linear-gradient(90deg, #2563EB, #C7D2FE)" }} />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-2xl text-white font-bold text-sm mb-3 shadow-md mx-auto"
                  style={{ background: "linear-gradient(135deg, #2563EB" }}>
                  {p.icon}
                </div>
                <div className="text-[10px] font-bold text-blue-600 mb-0.5">{p.step}</div>
                <h4 className="font-bold text-slate-800 text-xs mb-1">{p.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          CTA
      ════════════════════════════ */}
      <section className="py-14 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #4F46E5 100%)" }}>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #93C5FD, transparent)", filter: "blur(50px)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #A78BFA, transparent)", filter: "blur(40px)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-dots)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-4 bg-white/15 text-blue-100 border border-white/20">
             Mulai sekarang
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Butuh Barang untuk Kegiatan Sekolah?
          </h2>
          <p className="text-blue-100/80 text-sm mb-8">
            Ajukan permintaan sekarang dan tim pengadaan kami akan segera memprosesnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pemesanan"
              className="flex items-center justify-center gap-2 bg-white font-bold px-8 py-3 rounded-xl text-sm shadow hover:bg-blue-50 transition"
              style={{ color: "#2563EB" }}>
              <ClipboardList size={15} /> Mulai Pemesanan
            </Link>
            <Link href="/riwayat"
              className="flex items-center justify-center gap-2 font-bold px-8 py-3 rounded-xl text-sm border border-white/30 text-white hover:bg-white/10 transition">
              <Search size={15} /> Cek Status Pesanan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
