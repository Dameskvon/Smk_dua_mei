"use client";

import { useAppState } from "@/lib/appState";
import { useAuth } from "@/lib/auth";
import { formatRupiah, formatTanggal, unitDepartemenList, kategoriBarangList } from "@/lib/data";
import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";

interface Signatory { nama: string; jabatan: string; }

/* ── colour palette (mirrors exportExcel.ts) ── */
const C = {
  blue:   "#003580",
  yellow: "#FCE183",
  white:  "#FFFFFF",
  gray1:  "#F0F4FA",
  gray2:  "#E8EDF5",
  red:    "#DC2626",
  green:  "#16A34A",
  amber:  "#D97706",
};

const statusColor: Record<string, string> = {
  menunggu:  C.amber,
  diproses:  "#2563EB",
  disetujui: C.green,
  selesai:   "#6B7280",
  ditolak:   C.red,
  revisi:    "#EA580C",
};

const fmtDate = () =>
  new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

/* ── shared table styles ── */
const th: React.CSSProperties = {
  background: C.blue,
  color: C.white,
  padding: "6px 10px",
  fontSize: "8.5pt",
  fontWeight: 700,
  border: "1px solid #444",
  whiteSpace: "nowrap",
};
const thC: React.CSSProperties = { ...th, textAlign: "center" };
const thR: React.CSSProperties = { ...th, textAlign: "right" };

const td = (row: number): React.CSSProperties => ({
  background: row % 2 === 0 ? C.gray1 : C.white,
  padding: "5px 10px",
  fontSize: "8.5pt",
  border: "1px solid #ccc",
  verticalAlign: "middle",
});
const tdC = (row: number): React.CSSProperties => ({ ...td(row), textAlign: "center" });
const tdR = (row: number): React.CSSProperties => ({ ...td(row), textAlign: "right" });

const tfootTd: React.CSSProperties = {
  background: C.gray2,
  padding: "5px 10px",
  fontSize: "8.5pt",
  fontWeight: 700,
  color: C.blue,
  border: "1px solid #aaa",
};
const tfootTdR: React.CSSProperties = { ...tfootTd, textAlign: "right" };
const tfootTdC: React.CSSProperties = { ...tfootTd, textAlign: "center" };

const sectionHeader: React.CSSProperties = {
  background: C.blue,
  color: C.white,
  padding: "5px 10px",
  fontSize: "10pt",
  fontWeight: 700,
  letterSpacing: "0.5px",
  marginBottom: 0,
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

  /* ── computed values (same as Excel export) ── */
  const totalAnggaran     = pengadaanList.reduce((s, p) => s + p.estimasiHarga, 0);
  const nilaiInventaris   = katalogList.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);
  const allItems          = [...permintaanList, ...pengadaanList];
  const totalItems        = allItems.length;

  const statusCounts = {
    menunggu:  allItems.filter((p) => p.status === "menunggu").length,
    diproses:  allItems.filter((p) => p.status === "diproses").length,
    disetujui: allItems.filter((p) => p.status === "disetujui").length,
    selesai:   allItems.filter((p) => p.status === "selesai").length,
    ditolak:   allItems.filter((p) => p.status === "ditolak").length,
    revisi:    allItems.filter((p) => p.status === "revisi").length,
  };

  const anggaranDisetujui = pengadaanList
    .filter((p) => p.status === "disetujui")
    .reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranMenunggu  = pengadaanList
    .filter((p) => ["menunggu", "diproses"].includes(p.status))
    .reduce((s, p) => s + p.estimasiHarga, 0);
  const anggaranDitolak   = pengadaanList
    .filter((p) => p.status === "ditolak")
    .reduce((s, p) => s + p.estimasiHarga, 0);

  const stokMenipis = katalogList.filter((b) => b.stok > 0 && b.stok <= b.minStok).length;
  const stokHabis   = katalogList.filter((b) => b.stok === 0).length;

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
  const deptTot  = deptRows.reduce((s, [, d]) => ({ pem: s.pem + d.pem, pgd: s.pgd + d.pgd, anggaran: s.anggaran + d.anggaran }), { pem: 0, pgd: 0, anggaran: 0 });

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
    const token = typeof window !== "undefined" ? localStorage.getItem("smk_token") : null;
    if (!token) return;
    fetch("/api/users/signatories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.kepalaSekolah) setKepalaSekolah(data.kepalaSekolah);
        if (data.adminUser)     setAdminUser(data.adminUser);
      })
      .catch(() => {});
  }, []);

  return (
    <ProtectedPage allowedRoles={["kepala_sekolah", "admin", "admin_it"]}>
      {/* Landscape + screen background for this page only */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 landscape; margin: 10mm 14mm 15mm 14mm; }
          body { background: white !important; }
        }
        @media screen {
          body { background: #e5e7eb !important; }
        }
      ` }} />

      {/* ── Screen controls (hidden when printing) ── */}
      <div
        className="screen-only"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: C.blue,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ color: C.white, fontWeight: 700, fontSize: "14px" }}>
          Preview Cetak Laporan — SMK Dua Mei
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.history.back()}
            style={{ padding: "6px 16px", borderRadius: 8, background: "rgba(255,255,255,0.15)", color: C.white, fontWeight: 600, fontSize: "13px", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}
          >
            ← Kembali
          </button>
          <button
            onClick={() => window.print()}
            style={{ padding: "6px 20px", borderRadius: 8, background: C.yellow, color: C.blue, fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer" }}
          >
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* ── Print Document ── */}
      <div
        id="laporan-print"
        style={{
          maxWidth: "960px",
          margin: "24px auto",
          background: C.white,
          padding: "32px 40px",
          fontFamily: "'Times New Roman', Georgia, serif",
          fontSize: "9.5pt",
          color: "#111",
          boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
          borderRadius: 4,
        }}
      >
        {/* ════════════════════════════
            KOP SURAT
        ════════════════════════════ */}
        <div style={{ borderBottom: `3px solid ${C.blue}`, paddingBottom: 10, marginBottom: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ width: 90, verticalAlign: "middle", padding: 0, border: "none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-smk.svg" alt="Logo SMK Dua Mei" style={{ width: 80, height: 80 }} />
                </td>
                <td style={{ verticalAlign: "middle", paddingLeft: 14, border: "none" }}>
                  <div style={{ fontSize: "19pt", fontWeight: 900, color: C.blue, letterSpacing: "0.5px" }}>SMK DUA MEI</div>
                  <div style={{ fontSize: "10.5pt", fontWeight: 700, color: "#222", marginTop: 2 }}>Yayasan Pendidikan Dua Mei</div>
                  <div style={{ fontSize: "8.5pt", color: "#555", marginTop: 1 }}>Jl. Raya Dua Mei No. 1, Ciputat Timur, Tangerang Selatan 15412</div>
                  <div style={{ fontSize: "8.5pt", color: "#555" }}>Telp: (021) 7490-xxxx &nbsp;|&nbsp; Email: smkduamei@edu.id &nbsp;|&nbsp; NPSN: xxxxxxxx</div>
                </td>
              </tr>
            </tbody>
          </table>
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
                ["Total Pemesanan Barang",            permintaanList.length],
                ["Total Pengajuan Pengadaan",          pengadaanList.length],
                ["Total Seluruh Pengajuan",            totalItems],
                ["—", "—"],
                ["Menunggu Persetujuan",               statusCounts.menunggu],
                ["Sedang Diproses",                    statusCounts.diproses],
                ["Disetujui",                          statusCounts.disetujui],
                ["Selesai",                            statusCounts.selesai],
                ["Ditolak",                            statusCounts.ditolak],
                ["Revisi",                             statusCounts.revisi],
                ["—", "—"],
                ["Total Estimasi Anggaran",            formatRupiah(totalAnggaran)],
                ["Anggaran Disetujui",                 formatRupiah(anggaranDisetujui)],
                ["Anggaran Menunggu / Diproses",       formatRupiah(anggaranMenunggu)],
                ["Anggaran Ditolak",                   formatRupiah(anggaranDitolak)],
                ["—", "—"],
                ["Nilai Total Inventaris Stok",        formatRupiah(nilaiInventaris)],
                ["Jumlah Item Stok Menipis",           stokMenipis],
                ["Jumlah Item Stok Habis",             stokHabis],
              ] as [string, string | number][]).map(([label, val], i) => {
                const isSep = label === "—";
                return (
                  <tr key={i}>
                    <td style={{ ...tdC(i), color: isSep ? "transparent" : undefined }}>{isSep ? "" : i + 1 - Math.floor(i / 4)}</td>
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
                const kColor  = kondisi === "Habis" ? C.red : kondisi === "Menipis" ? C.amber : C.green;
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
                <td style={{ border: "none", width: "33%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                  <div style={{ fontSize: "9pt" }}>Dibuat oleh,</div>
                  <div style={{ marginTop: 56, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                    {user?.nama ?? "—"}
                  </div>
                  <div style={{ fontSize: "8pt", color: "#555" }}>{user?.jabatan ?? "—"}</div>
                </td>
                <td style={{ border: "none", width: "33%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
                  <div style={{ fontSize: "9pt" }}>Mengetahui,</div>
                  <div style={{ marginTop: 56, borderTop: "1px solid #000", paddingTop: 4, fontSize: "9pt", fontWeight: 700 }}>
                    {adminUser?.nama ?? "—"}
                  </div>
                  <div style={{ fontSize: "8pt", color: "#555" }}>{adminUser?.jabatan ?? "Admin Tata Usaha"}</div>
                </td>
                <td style={{ border: "none", width: "34%", textAlign: "center", verticalAlign: "top", padding: "0 10px" }}>
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

        {/* ════════════════════════════
            FOOTER
        ════════════════════════════ */}
        <div style={{ marginTop: 24, borderTop: "1px solid #ccc", paddingTop: 6, textAlign: "center", fontSize: "7.5pt", color: "#888" }}>
          Dokumen ini dicetak secara otomatis oleh Sistem Pengadaan Internal SMK Dua Mei &bull;{" "}
          {new Date().toLocaleString("id-ID")} &bull; Dokumen sah tanpa tanda tangan basah jika dicetak dari sistem resmi.
        </div>
      </div>
    </ProtectedPage>
  );
}
