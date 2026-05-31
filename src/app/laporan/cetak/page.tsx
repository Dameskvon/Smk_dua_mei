"use client";

import { useAppState } from "@/lib/appState";
import { useAuth } from "@/lib/auth";
import { formatRupiah, formatTanggal, unitDepartemenList, kategoriBarangList } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";

interface Signatory { nama: string; jabatan: string; }

/* ── colour palette (mirrors exportExcel.ts) ── */
const C = {
  blue: "#016bffff",
  yellow: "#FCE183",
  white: "#FFFFFF",
  gray1: "#F0F4FA",
  gray2: "#E8EDF5",
  red: "#DC2626",
  green: "#16A34A",
  amber: "#D97706",
};

const statusColor: Record<string, string> = {
  menunggu: C.amber,
  diproses: "#2563EB",
  disetujui: C.green,
  selesai: "#6B7280",
  ditolak: C.red,
  revisi: "#EA580C",
};

const fmtDate = () =>
  new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

/* ── shared table styles ── */
const FONT = "Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif";
const HEADER_BG = "#1a73e8"; // biru muda

const th: React.CSSProperties = {
  background: HEADER_BG,
  color: C.white,
  padding: "6px 10px",
  fontSize: "8.5pt",
  fontWeight: 700,
  border: "1px solid #5ba4f5",
  whiteSpace: "nowrap",
  fontFamily: FONT,
};
const thC: React.CSSProperties = { ...th, textAlign: "center" };
const thR: React.CSSProperties = { ...th, textAlign: "right" };

const td = (row: number): React.CSSProperties => ({
  background: row % 2 === 0 ? C.gray1 : C.white,
  padding: "5px 10px",
  fontSize: "8.5pt",
  border: "1px solid #ccc",
  verticalAlign: "middle",
  fontFamily: FONT,
});
const tdC = (row: number): React.CSSProperties => ({ ...td(row), textAlign: "center" });
const tdR = (row: number): React.CSSProperties => ({ ...td(row), textAlign: "right" });

const tfootTd: React.CSSProperties = {
  background: "#dbeafe",
  padding: "5px 10px",
  fontSize: "8.5pt",
  fontWeight: 700,
  color: "#1e40af",
  border: "1px solid #93c5fd",
  fontFamily: FONT,
};
const tfootTdR: React.CSSProperties = { ...tfootTd, textAlign: "right" };
const tfootTdC: React.CSSProperties = { ...tfootTd, textAlign: "center" };

const sectionHeader: React.CSSProperties = {
  background: HEADER_BG,
  color: C.white,
  padding: "5px 10px",
  fontSize: "10pt",
  fontWeight: 700,
  letterSpacing: "0.5px",
  marginBottom: 0,
  fontFamily: FONT,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "18px",
  tableLayout: "auto",
};

export default function CetakLaporanPage() {
  const { permintaanList, pengadaanList, katalogList } = useAppState();
  const { user } = useAuth();
  const [kepalaSekolah, setKepalaSekolah] = useState<Signatory | null>(null);
  const [adminUser, setAdminUser] = useState<Signatory | null>(null);
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    const element = contentRef.current;
    if (!element) return;
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const SCALE = 2;
      const canvas = await html2canvas(element, {
        scale: SCALE,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();   // ~841 pt
      const pageH = pdf.internal.pageSize.getHeight();  // ~595 pt
      const margin = 28; // ~10mm
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      // scale factor: canvas px → PDF pt
      const px2pt = contentW / canvas.width;
      const totalPt = canvas.height * px2pt;

      // collect safe break points (bottom of every <tr>) in PDF pt
      const elTop = element.getBoundingClientRect().top;
      const safeBreaks: number[] = [0];
      element.querySelectorAll("tr").forEach((row) => {
        const bottom = row.getBoundingClientRect().bottom - elTop;
        safeBreaks.push(bottom * SCALE * px2pt);
      });
      safeBreaks.push(totalPt);

      // split into pages at row boundaries
      let pageStart = 0;
      let first = true;
      while (pageStart < totalPt - 1) {
        const pageEnd = pageStart + contentH;
        // find largest safe break ≤ pageEnd that is > pageStart
        let cut = pageEnd;
        for (const bp of safeBreaks) {
          if (bp > pageStart && bp <= pageEnd) cut = bp;
        }
        if (cut <= pageStart) cut = pageEnd; // fallback

        const sliceHeightPx = Math.ceil((cut - pageStart) / px2pt);
        const sliceStartPx = Math.round(pageStart / px2pt);

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceHeightPx;
        const ctx = slice.getContext("2d");
        ctx?.drawImage(canvas, 0, sliceStartPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

        if (!first) pdf.addPage();
        pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, margin, contentW, sliceHeightPx * px2pt);
        first = false;
        pageStart = cut;
      }

      pdf.save(`Laporan-SMK-Dua-Mei-${new Date().toISOString().split("T")[0]}.pdf`);
      setTimeout(() => window.close(), 500);
    } finally {
      setGenerating(false);
    }
  };

  /* ── computed values (same as Excel export) ── */
  const totalAnggaran = pengadaanList.reduce((s, p) => s + p.estimasiHarga, 0);
  const nilaiInventaris = katalogList.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);
  const allItems = [...permintaanList, ...pengadaanList];
  const totalItems = allItems.length;

  const statusCounts = {
    menunggu: allItems.filter((p) => p.status === "menunggu").length,
    diproses: allItems.filter((p) => p.status === "diproses").length,
    disetujui: allItems.filter((p) => p.status === "disetujui").length,
    selesai: allItems.filter((p) => p.status === "selesai").length,
    ditolak: allItems.filter((p) => p.status === "ditolak").length,
    revisi: allItems.filter((p) => p.status === "revisi").length,
  };

  const anggaranDisetujui = pengadaanList
    .filter((p) => p.status === "disetujui")
    .reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranMenunggu = pengadaanList
    .filter((p) => ["menunggu", "diproses"].includes(p.status))
    .reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDitolak = pengadaanList
    .filter((p) => p.status === "ditolak")
    .reduce((s, p) => s + p.estimasiHarga, 0);

  const stokMenipis = katalogList.filter((b) => b.stok > 0 && b.stok <= b.minStok).length;
  const stokHabis = katalogList.filter((b) => b.stok === 0).length;

  /* Per departemen */
  const perDeptMap: Record<string, { pem: number; pgd: number; anggaran: number }> = {};
  permintaanList.forEach((p) => {
    if (!perDeptMap[p.unitDepartemen]) perDeptMap[p.unitDepartemen] = { pem: 0, pgd: 0, anggaran: 0 };
    perDeptMap[p.unitDepartemen].pem++;
  });
  pengadaanList.forEach((p) => {
    if (!perDeptMap[p.unitDepartemen]) perDeptMap[p.unitDepartemen] = { pem: 0, pgd: 0, anggaran: 0 };
    perDeptMap[p.unitDepartemen].pgd++;
    perDeptMap[p.unitDepartemen].anggaran += p.estimasiHarga;
  });
  const deptRows = Object.entries(perDeptMap).sort((a, b) => b[1].anggaran - a[1].anggaran);
  const deptTot = deptRows.reduce((s, [, d]) => ({ pem: s.pem + d.pem, pgd: s.pgd + d.pgd, anggaran: s.anggaran + d.anggaran }), { pem: 0, pgd: 0, anggaran: 0 });

  /* Per jenis/kategori */
  const perJenis = kategoriBarangList
    .map((jenis) => {
      const items = pengadaanList.filter((p) => p.jenisBarang === jenis);
      return { jenis, jumlah: items.length, anggaran: items.reduce((s, p) => s + p.estimasiHarga, 0) };
    })
    .filter((d) => d.jumlah > 0)
    .sort((a, b) => b.anggaran - a.anggaran);

  /* unitDepartemenList used to ensure consistent ordering */
  void unitDepartemenList;

  useEffect(() => {
    document.title = `Laporan SMK Dua Mei — ${new Date().toISOString().split("T")[0]}`;

    // Preload PNG logo so html2canvas can capture it
    const logoImg = new Image();
    logoImg.src = "/logo.png";

    const saved = typeof window !== "undefined" ? localStorage.getItem("smk_user") : null;
    if (!saved) {
      logoImg.onload = () => setTimeout(() => generatePDF(), 300);
      logoImg.onerror = () => setTimeout(() => generatePDF(), 300);
      return;
    }
    const token = Buffer.from(saved).toString("base64");
    fetch("/api/users/signatories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.kepalaSekolah) setKepalaSekolah(data.kepalaSekolah);
        if (data.adminUser) setAdminUser(data.adminUser);
      })
      .catch(() => { })
      .finally(() => {
        logoImg.onload = () => setTimeout(() => generatePDF(), 300);
        logoImg.onerror = () => setTimeout(() => generatePDF(), 300);
        if (logoImg.complete) setTimeout(() => generatePDF(), 300);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin", "admin_it"]}>
      {/* Loading overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#ffffff",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ width: 48, height: 48, border: `5px solid #e0eaff`, borderTop: `5px solid #1e6fff`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: C.blue, fontWeight: 700, fontSize: "16px" }}>Membuat PDF...</div>
        <div style={{ color: "#5b8dee", fontSize: "13px" }}>File akan otomatis terunduh</div>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>

      {/* Document rendered off-screen for html2canvas */}
      <div
        ref={contentRef}
        id="laporan-print"
        style={{
          position: "fixed", left: "-9999px", top: 0,
          width: "1200px",
          padding: "32px 40px",
          background: C.white,
          fontFamily: FONT,
          fontSize: "9.5pt",
          color: "#111",
        }}
      >
        {/* ════════════════════════════
            KOP SURAT
        ════════════════════════════ */}
        <div style={{ borderBottom: `3px solid ${C.blue}`, paddingBottom: 12, marginBottom: 14, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo SMK Dua Mei" style={{ width: 60, height: 60, display: "block", margin: "0 auto 8px" }} />
          <div style={{ fontSize: "19pt", fontWeight: 900, color: C.blue, letterSpacing: "0.5px" }}>SMK DUA MEI</div>
          <div style={{ fontSize: "10.5pt", fontWeight: 700, color: "#010000ff", marginTop: 2 }}>Yayasan Pendidikan Dua Mei</div>
          <div style={{ fontSize: "9.5pt", color: "#555", marginTop: 2 }}>Jl. H.Abdul Gani No.135 Ciputat Tangerang, Kec. Ciputat Timur, Kota Tangerang Selatan, Banten, 15412</div>
          <div style={{ fontSize: "9.5pt", color: "#555", marginTop: 1 }}>Telp: (021) 7490 034 &nbsp;|&nbsp; Email: duameismk135@yahoo.co.id &nbsp;|&nbsp; NPSN: 20603266</div>
        </div>

        {/* ════════════════════════════
            JUDUL
        ════════════════════════════ */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "13pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px", color: "#111" }}>
            Laporan Rekap Pemesanan &amp; Pengadaan Barang
          </div>
          <div style={{ fontSize: "10pt", color: "#444", marginTop: 3 }}>Sistem Pengadaan Internal — SMK Dua Mei</div>
          <div style={{ fontSize: "9pt", color: "#666", marginTop: 2 }}>Tanggal Cetak: {fmtDate()}</div>
        </div>

        {/* ════════════════════════════
            A. RINGKASAN
        ════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeader}>A. RINGKASAN STATISTIK</div>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...thC, width: "6%" }}>No</th>
                <th style={{ ...th }}>Indikator</th>
                <th style={{ ...thC, width: "24%" }}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {([
                ["Total Pemesanan Barang", permintaanList.length],
                ["Total Pengajuan Pengadaan", pengadaanList.length],
                ["Total Seluruh Pengajuan", totalItems],
                ["—", "—"],
                ["Menunggu Persetujuan", statusCounts.menunggu],
                ["Sedang Diproses", statusCounts.diproses],
                ["Disetujui", statusCounts.disetujui],
                ["Selesai", statusCounts.selesai],
                ["Ditolak", statusCounts.ditolak],
                ["Revisi", statusCounts.revisi],
                ["—", "—"],
                ["Total Estimasi Anggaran", formatRupiah(totalAnggaran)],
                ["Anggaran Disetujui", formatRupiah(anggaranDisetujui)],
                ["Anggaran Menunggu / Diproses", formatRupiah(anggaranMenunggu)],
                ["Anggaran Ditolak", formatRupiah(anggaranDitolak)],
                ["—", "—"],
                ["Nilai Total Inventaris Stok", formatRupiah(nilaiInventaris)],
                ["Jumlah Item Stok Menipis", stokMenipis],
                ["Jumlah Item Stok Habis", stokHabis],
              ] as [string, string | number][]).map(([label, val], i, arr) => {
                const isSep = label === "—";
                const sepsBefore = arr.slice(0, i).filter(([l]) => l === "—").length;
                const rowNum = i + 1 - sepsBefore;
                return (
                  <tr key={i}>
                    <td style={{ ...tdC(i), color: isSep ? "transparent" : undefined }}>{isSep ? "" : rowNum}</td>
                    <td style={{ ...td(i), fontStyle: isSep ? "italic" : "normal", color: isSep ? "#ccc" : undefined }}>
                      {isSep ? "" : label}
                    </td>
                    <td style={{ ...tdC(i), fontWeight: isSep ? 400 : 700 }}>
                      {isSep ? "" : val}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ════════════════════════════
            B. PER DEPARTEMEN
        ════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeader}>B. REKAP PER UNIT / DEPARTEMEN</div>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...thC, width: "5%" }}>No</th>
                <th style={th}>Unit / Departemen</th>
                <th style={{ ...thC, width: "13%" }}>Pemesanan</th>
                <th style={{ ...thC, width: "13%" }}>Pengadaan</th>
                <th style={{ ...thC, width: "13%" }}>Total</th>
                <th style={{ ...thR, width: "22%" }}>Total Anggaran</th>
                <th style={{ ...thC, width: "10%" }}>% Anggaran</th>
              </tr>
            </thead>
            <tbody>
              {deptRows.map(([unit, d], i) => (
                <tr key={unit}>
                  <td style={tdC(i)}>{i + 1}</td>
                  <td style={td(i)}>{unit}</td>
                  <td style={tdC(i)}>{d.pem}</td>
                  <td style={tdC(i)}>{d.pgd}</td>
                  <td style={{ ...tdC(i), fontWeight: 700 }}>{d.pem + d.pgd}</td>
                  <td style={tdR(i)}>{formatRupiah(d.anggaran)}</td>
                  <td style={tdC(i)}>{totalAnggaran > 0 ? Math.round((d.anggaran / totalAnggaran) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ ...tfootTd, textAlign: "right" }}>TOTAL</td>
                <td style={tfootTdC}>{deptTot.pem}</td>
                <td style={tfootTdC}>{deptTot.pgd}</td>
                <td style={tfootTdC}>{deptTot.pem + deptTot.pgd}</td>
                <td style={tfootTdR}>{formatRupiah(deptTot.anggaran)}</td>
                <td style={tfootTdC}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ════════════════════════════
            C. PER JENIS BARANG
        ════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeader}>C. REKAP PER JENIS / KATEGORI BARANG</div>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...thC, width: "5%" }}>No</th>
                <th style={th}>Jenis / Kategori Barang</th>
                <th style={{ ...thC, width: "18%" }}>Jumlah Pengajuan</th>
                <th style={{ ...thR, width: "24%" }}>Total Anggaran</th>
                <th style={{ ...thC, width: "12%" }}>% Anggaran</th>
              </tr>
            </thead>
            <tbody>
              {perJenis.map((d, i) => (
                <tr key={d.jenis}>
                  <td style={tdC(i)}>{i + 1}</td>
                  <td style={td(i)}>{d.jenis}</td>
                  <td style={tdC(i)}>{d.jumlah}</td>
                  <td style={tdR(i)}>{formatRupiah(d.anggaran)}</td>
                  <td style={tdC(i)}>{totalAnggaran > 0 ? Math.round((d.anggaran / totalAnggaran) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ ...tfootTd, textAlign: "right" }}>TOTAL</td>
                <td style={tfootTdC}>{perJenis.reduce((s, d) => s + d.jumlah, 0)}</td>
                <td style={tfootTdR}>{formatRupiah(totalAnggaran)}</td>
                <td style={tfootTdC}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ════════════════════════════
            D. DAFTAR PENGADAAN
        ════════════════════════════ */}
        <div style={{ marginBottom: 20, breakBefore: "page" }}>
          <div style={sectionHeader}>D. DAFTAR PENGAJUAN PENGADAAN BARANG</div>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...thC, width: "4%" }}>No</th>
                <th style={{ ...th, width: "14%" }}>Nomor Pengadaan</th>
                <th style={{ ...th, width: "12%" }}>Tanggal</th>
                <th style={th}>Nama Pengaju</th>
                <th style={th}>Unit / Departemen</th>
                <th style={th}>Jenis Barang</th>
                <th style={{ ...thC, width: "5%" }}>Jml</th>
                <th style={{ ...thC, width: "7%" }}>Satuan</th>
                <th style={{ ...thR, width: "14%" }}>Estimasi Harga</th>
                <th style={{ ...thC, width: "9%" }}>Prioritas</th>
                <th style={{ ...thC, width: "9%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pengadaanList.map((p, i) => (
                <tr key={p.id}>
                  <td style={tdC(i)}>{i + 1}</td>
                  <td style={{ ...td(i), fontFamily: "monospace", fontSize: "7.5pt", color: "#92400E" }}>{p.nomorPengadaan}</td>
                  <td style={{ ...tdC(i), fontSize: "7.5pt" }}>{formatTanggal(p.tanggalPengadaan)}</td>
                  <td style={td(i)}>{p.namaPengaju}</td>
                  <td style={{ ...td(i), fontSize: "7.5pt" }}>{p.unitDepartemen}</td>
                  <td style={td(i)}>{p.jenisBarang}</td>
                  <td style={tdC(i)}>{p.jumlah}</td>
                  <td style={tdC(i)}>{p.satuan}</td>
                  <td style={tdR(i)}>{formatRupiah(p.estimasiHarga)}</td>
                  <td style={{ ...tdC(i), fontSize: "7.5pt", textTransform: "capitalize" }}>{p.prioritas}</td>
                  <td style={{ ...tdC(i), fontWeight: 700, color: statusColor[p.status] ?? "#111", fontSize: "7.5pt", textTransform: "capitalize" }}>{p.status}</td>
                </tr>
              ))}
              {pengadaanList.length === 0 && (
                <tr><td colSpan={11} style={{ ...tdC(0), fontStyle: "italic", color: "#888" }}>Tidak ada data pengadaan</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={8} style={{ ...tfootTd, textAlign: "right" }}>TOTAL ANGGARAN</td>
                <td style={tfootTdR}>{formatRupiah(totalAnggaran)}</td>
                <td colSpan={2} style={tfootTd}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ════════════════════════════
            E. DAFTAR PEMESANAN
        ════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeader}>E. DAFTAR PERMINTAAN PEMESANAN BARANG</div>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...thC, width: "4%" }}>No</th>
                <th style={{ ...th, width: "16%" }}>Nomor Pesanan</th>
                <th style={{ ...th, width: "12%" }}>Tanggal</th>
                <th style={th}>Nama Pemesan</th>
                <th style={th}>Unit / Departemen</th>
                <th style={{ ...th, width: "20%" }}>Keperluan</th>
                <th style={{ ...thC, width: "9%" }}>Prioritas</th>
                <th style={{ ...thC, width: "9%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {permintaanList.map((p, i) => (
                <tr key={p.id}>
                  <td style={tdC(i)}>{i + 1}</td>
                  <td style={{ ...td(i), fontFamily: "monospace", fontSize: "7.5pt", color: "#1D4ED8" }}>{p.nomorPesanan}</td>
                  <td style={{ ...tdC(i), fontSize: "7.5pt" }}>{formatTanggal(p.tanggalPesan)}</td>
                  <td style={td(i)}>{p.namaPemesan}</td>
                  <td style={{ ...td(i), fontSize: "7.5pt" }}>{p.unitDepartemen}</td>
                  <td style={{ ...td(i), fontSize: "7.5pt" }}>{p.keperluan}</td>
                  <td style={{ ...tdC(i), fontSize: "7.5pt", textTransform: "capitalize" }}>{p.prioritas}</td>
                  <td style={{ ...tdC(i), fontWeight: 700, color: statusColor[p.status] ?? "#111", fontSize: "7.5pt", textTransform: "capitalize" }}>{p.status}</td>
                </tr>
              ))}
              {permintaanList.length === 0 && (
                <tr><td colSpan={8} style={{ ...tdC(0), fontStyle: "italic", color: "#888" }}>Tidak ada data pemesanan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ════════════════════════════
            F. INVENTARIS STOK
        ════════════════════════════ */}
        <div style={{ marginBottom: 20, breakBefore: "page" }}>
          <div style={sectionHeader}>F. REKAP INVENTARIS &amp; STOK BARANG</div>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...thC, width: "4%" }}>No</th>
                <th style={th}>Nama Barang</th>
                <th style={{ ...th, width: "16%" }}>Kategori</th>
                <th style={{ ...thC, width: "7%" }}>Stok</th>
                <th style={{ ...thC, width: "8%" }}>Min Stok</th>
                <th style={{ ...thC, width: "7%" }}>Satuan</th>
                <th style={{ ...thR, width: "14%" }}>Harga Satuan</th>
                <th style={{ ...thR, width: "14%" }}>Nilai Total</th>
                <th style={{ ...thC, width: "9%" }}>Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {katalogList.map((b, i) => {
                const kondisi = b.stok === 0 ? "Habis" : b.stok <= b.minStok ? "Menipis" : "Normal";
                const kColor = kondisi === "Habis" ? C.red : kondisi === "Menipis" ? C.amber : C.green;
                return (
                  <tr key={b.id}>
                    <td style={tdC(i)}>{i + 1}</td>
                    <td style={td(i)}>{b.namaBarang}</td>
                    <td style={{ ...td(i), fontSize: "7.5pt" }}>{b.kategori}</td>
                    <td style={{ ...tdC(i), fontWeight: b.stok <= b.minStok ? 700 : 400, color: b.stok === 0 ? C.red : "#111" }}>{b.stok}</td>
                    <td style={tdC(i)}>{b.minStok}</td>
                    <td style={tdC(i)}>{b.satuan}</td>
                    <td style={{ ...tdR(i), fontSize: "7.5pt" }}>{formatRupiah(b.hargaSatuan)}</td>
                    <td style={{ ...tdR(i), fontSize: "7.5pt" }}>{formatRupiah(b.stok * b.hargaSatuan)}</td>
                    <td style={{ ...tdC(i), fontWeight: 700, color: kColor, fontSize: "8pt" }}>{kondisi}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} style={{ ...tfootTd, textAlign: "right" }}>TOTAL NILAI INVENTARIS</td>
                <td style={tfootTdR}>{formatRupiah(nilaiInventaris)}</td>
                <td style={tfootTd}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ════════════════════════════
            TANDA TANGAN
        ════════════════════════════ */}
        <div style={{ marginTop: 36 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ border: "none", width: "50%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                  <div style={{ fontSize: "9pt", visibility: "hidden", marginBottom: 2 }}>placeholder</div>
                  <div style={{ fontSize: "9pt" }}>Dibuat oleh,</div>
                  <div style={{ marginTop: 48, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                    {user?.nama ?? "—"}
                  </div>
                  <div style={{ fontSize: "8pt", color: "#555" }}>{user?.jabatan ?? "—"}</div>
                </td>
                <td style={{ border: "none", width: "50%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                  <div style={{ fontSize: "9pt", marginBottom: 2 }}>
                    Ciputat, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                  </div>
                  <div style={{ fontSize: "9pt" }}>Kepala Sekolah,</div>
                  <div style={{ marginTop: 48, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                    {kepalaSekolah?.nama ?? "—"}
                  </div>
                  <div style={{ fontSize: "8pt", color: "#555" }}>{kepalaSekolah?.jabatan ?? "Kepala Sekolah"}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedPage>
  );
}
