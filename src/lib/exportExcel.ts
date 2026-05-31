import XLSXStyle from "xlsx-js-style";
import type { FormPemesanan, FormPengadaan, KatalogBarang } from "@/types";

type Cell = { v: string | number; s: Record<string, unknown> };
type WS = Record<string, Cell | string | unknown[]>;

const BLUE   = "003580";
const WHITE  = "FFFFFF";
// Per-sheet header colours
const H_RINGKASAN  = "1a73e8"; // biru
const H_PEMESANAN  = "0f766e"; // teal
const H_PENGADAAN  = "b45309"; // amber gelap
const H_DEPARTEMEN = "7c3aed"; // ungu
const H_INVENTARIS = "166534"; // hijau gelap
const GRAY1 = "F0F4FA";
const GRAY2 = "E8EDF5";
const RED   = "DC2626";
const GREEN = "16A34A";
const AMBER = "D97706";

const mkFont = (bold = false, color = "000000", sz = 10) =>
  ({ name: "Arial", sz, bold, color: { rgb: color } });

const mkFill = (rgb: string) => ({ patternType: "solid", fgColor: { rgb } });

const mkBorder = () => ({
  top:    { style: "thin", color: { rgb: "444444" } },
  bottom: { style: "thin", color: { rgb: "444444" } },
  left:   { style: "thin", color: { rgb: "444444" } },
  right:  { style: "thin", color: { rgb: "444444" } },
});

const AC = { horizontal: "center", vertical: "center" };
const AR = { horizontal: "right",  vertical: "center" };
const AL = { horizontal: "left",   vertical: "center" };

const S = {
  hdr:   { font: mkFont(true, WHITE, 10), fill: mkFill(BLUE), border: mkBorder(), alignment: AC },
  hdrL:  { font: mkFont(true, WHITE, 10), fill: mkFill(BLUE), border: mkBorder(), alignment: AL },
  hdrR:  { font: mkFont(true, WHITE, 10), fill: mkFill(BLUE), border: mkBorder(), alignment: AR },
  cell:  (r: number) => ({ font: mkFont(), fill: mkFill(r % 2 === 0 ? GRAY1 : WHITE), border: mkBorder(), alignment: AL }),
  cellR: (r: number) => ({ font: mkFont(), fill: mkFill(r % 2 === 0 ? GRAY1 : WHITE), border: mkBorder(), alignment: AR }),
  cellC: (r: number) => ({ font: mkFont(), fill: mkFill(r % 2 === 0 ? GRAY1 : WHITE), border: mkBorder(), alignment: AC }),
  tot:   { font: mkFont(true, BLUE, 10), fill: mkFill(GRAY2), border: mkBorder(), alignment: AR },
  totL:  { font: mkFont(true, BLUE, 10), fill: mkFill(GRAY2), border: mkBorder(), alignment: AL },
  title: { font: mkFont(true, WHITE, 10), fill: mkFill(BLUE), alignment: AL },
  sub:   { font: mkFont(false, "444444", 9), alignment: AL },
};

const fmtRp  = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDt  = () => new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
const col    = (n: number) => String.fromCharCode(65 + n);
const sColor = (s: string) =>
  ({ menunggu: AMBER, diproses: "2563EB", disetujui: GREEN, selesai: "6B7280", ditolak: RED, revisi: "EA580C" }[s] ?? "000000");

function sheet(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  rightCols: number[] = [],
  centerCols: number[] = [],
  totalRow?: (string | number)[],
  widths?: number[],
  headerColor: string = BLUE,
): WS {
  const hdrStyle = (align: Record<string, string>) => ({
    font: mkFont(true, WHITE, 10), fill: mkFill(headerColor), border: mkBorder(), alignment: align,
  });
  const titleStyle = { font: mkFont(true, WHITE, 10), fill: mkFill(headerColor), alignment: AL };

  const ws: WS = {};
  const range = { s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: rows.length + 3 } };

  ws["A1"] = { v: title, s: titleStyle };
  for (let c = 1; c < headers.length; c++) ws[`${col(c)}1`] = { v: "", s: titleStyle };

  ws["A2"] = { v: `Tanggal Cetak: ${fmtDt()}`, s: S.sub };
  for (let c = 1; c < headers.length; c++) ws[`${col(c)}2`] = { v: "", s: S.sub };

  headers.forEach((h, c) => {
    ws[`${col(c)}3`] = { v: h, s: rightCols.includes(c) ? hdrStyle(AR) : c === 0 ? hdrStyle(AL) : hdrStyle(AC) };
  });

  rows.forEach((row, ri) => {
    row.forEach((val, c) => {
      const r = ri + 4;
      ws[`${col(c)}${r}`] = {
        v: val,
        s: rightCols.includes(c) ? S.cellR(ri) : centerCols.includes(c) ? S.cellC(ri) : S.cell(ri),
      };
    });
  });

  if (totalRow) {
    const r = rows.length + 4;
    totalRow.forEach((val, c) => {
      ws[`${col(c)}${r}`] = { v: val, s: c === 0 ? S.totL : S.tot };
    });
    range.e.r = r;
  }

  ws["!ref"]    = XLSXStyle.utils.encode_range(range);
  ws["!cols"]   = (widths ?? headers.map(() => 20)).map((w) => ({ wch: w }));
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ];

  return ws;
}

function colorCell(ws: WS, addr: string, color: string) {
  const cell = ws[addr] as Cell | undefined;
  if (!cell) return;
  cell.s = { ...cell.s, font: mkFont(true, color, 9), alignment: AC };
}

export function exportLaporanExcel(
  permintaanList: FormPemesanan[],
  pengadaanList: FormPengadaan[],
  katalogList: KatalogBarang[],
) {
  const wb = XLSXStyle.utils.book_new();
  wb.Props = { Title: "Laporan SMK Dua Mei", Author: "Sistem Pengadaan SMK Dua Mei", CreatedDate: new Date() };

  const totalAnggaran   = pengadaanList.reduce((s, p) => s + p.estimasiHarga, 0);
  const nilaiInventaris = katalogList.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);
  const allItems        = [...permintaanList, ...pengadaanList];

  // ── Sheet 1: Ringkasan ────────────────────────────────────────────────────
  XLSXStyle.utils.book_append_sheet(wb, sheet(
    "RINGKASAN LAPORAN — SMK DUA MEI",
    ["No", "Indikator", "Nilai"],

    [
      [1,  "Total Pemesanan Barang",        permintaanList.length],
      [2,  "Total Pengajuan Pengadaan",      pengadaanList.length],
      [3,  "Total Seluruh Pengajuan",        allItems.length],
      ["", "", ""],
      [4,  "Menunggu Persetujuan",           allItems.filter(p => p.status === "menunggu").length],
      [5,  "Sedang Diproses",               allItems.filter(p => p.status === "diproses").length],
      [6,  "Disetujui",                     allItems.filter(p => p.status === "disetujui").length],
      [7,  "Selesai",                       allItems.filter(p => p.status === "selesai").length],
      [8,  "Ditolak",                       allItems.filter(p => p.status === "ditolak").length],
      [9,  "Revisi",                        allItems.filter(p => p.status === "revisi").length],
      ["", "", ""],
      [10, "Total Estimasi Anggaran",       fmtRp(totalAnggaran)],
      [11, "Anggaran Disetujui",            fmtRp(pengadaanList.filter(p => p.status === "disetujui").reduce((s, p) => s + p.estimasiHarga, 0))],
      [12, "Anggaran Menunggu / Diproses",  fmtRp(pengadaanList.filter(p => ["menunggu","diproses"].includes(p.status)).reduce((s, p) => s + p.estimasiHarga, 0))],
      [13, "Anggaran Ditolak",              fmtRp(pengadaanList.filter(p => p.status === "ditolak").reduce((s, p) => s + p.estimasiHarga, 0))],
      ["", "", ""],
      [14, "Nilai Total Inventaris Stok",   fmtRp(nilaiInventaris)],
      [15, "Jumlah Item Stok Menipis",      katalogList.filter(b => b.stok > 0 && b.stok <= b.minStok).length],
      [16, "Jumlah Item Stok Habis",        katalogList.filter(b => b.stok === 0).length],
    ],
    [2], [0], undefined, [6, 42, 28], H_RINGKASAN,
  ), "Ringkasan");

  // ── Sheet 2: Pemesanan ────────────────────────────────────────────────────
  const wsPem = sheet(
    "DAFTAR PERMINTAAN PEMESANAN BARANG — SMK DUA MEI",
    ["No", "Nomor Pesanan", "Tanggal", "Nama Pemesan", "Unit / Departemen", "Keperluan", "Prioritas", "Status", "Catatan Admin"],
    permintaanList.map((p, i) => [
      i + 1, p.nomorPesanan, p.tanggalPesan, p.namaPemesan, p.unitDepartemen,
      p.keperluan,
      p.prioritas.charAt(0).toUpperCase() + p.prioritas.slice(1),
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
      p.catatanAdmin ?? "-",
    ]),
    [], [0, 6, 7], undefined, [5, 20, 14, 24, 24, 36, 12, 12, 28], H_PEMESANAN,
  );
  permintaanList.forEach((p, i) => colorCell(wsPem, `H${i + 4}`, sColor(p.status)));
  XLSXStyle.utils.book_append_sheet(wb, wsPem, "Pemesanan");

  // ── Sheet 3: Pengadaan ────────────────────────────────────────────────────
  const wsPgd = sheet(
    "DAFTAR PENGAJUAN PENGADAAN BARANG — SMK DUA MEI",
    ["No","Nomor Pengadaan","Tanggal","Nama Pengaju","Unit / Departemen","Jenis Barang","Spesifikasi","Jml","Satuan","Estimasi Harga","Sumber Dana","Prioritas","Status","Catatan Admin"],
    pengadaanList.map((p, i) => [
      i + 1, p.nomorPengadaan, p.tanggalPengadaan, p.namaPengaju, p.unitDepartemen,
      p.jenisBarang, p.spesifikasi, p.jumlah, p.satuan, fmtRp(p.estimasiHarga),
      p.sumberDana,
      p.prioritas.charAt(0).toUpperCase() + p.prioritas.slice(1),
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
      p.catatanAdmin ?? "-",
    ]),
    [9], [0, 7, 11, 12], undefined, [5, 20, 14, 24, 24, 20, 36, 6, 10, 20, 16, 12, 12, 28], H_PENGADAAN,
  );
  const totRow = pengadaanList.length + 4;
  wsPgd[`A${totRow}`] = { v: "TOTAL ANGGARAN", s: S.totL };
  wsPgd[`J${totRow}`] = { v: fmtRp(totalAnggaran), s: S.tot };
  pengadaanList.forEach((p, i) => colorCell(wsPgd, `M${i + 4}`, sColor(p.status)));
  XLSXStyle.utils.book_append_sheet(wb, wsPgd, "Pengadaan");

  // ── Sheet 4: Per Departemen ───────────────────────────────────────────────
  const deptMap: Record<string, { pemesanan: number; pengadaan: number; anggaran: number }> = {};
  permintaanList.forEach(p => {
    if (!deptMap[p.unitDepartemen]) deptMap[p.unitDepartemen] = { pemesanan: 0, pengadaan: 0, anggaran: 0 };
    deptMap[p.unitDepartemen].pemesanan++;
  });
  pengadaanList.forEach(p => {
    if (!deptMap[p.unitDepartemen]) deptMap[p.unitDepartemen] = { pemesanan: 0, pengadaan: 0, anggaran: 0 };
    deptMap[p.unitDepartemen].pengadaan++;
    deptMap[p.unitDepartemen].anggaran += p.estimasiHarga;
  });
  const deptEntries = Object.entries(deptMap).sort((a, b) => b[1].anggaran - a[1].anggaran);
  const deptTot = deptEntries.reduce((s, [, d]) => ({
    pemesanan: s.pemesanan + d.pemesanan, pengadaan: s.pengadaan + d.pengadaan, anggaran: s.anggaran + d.anggaran,
  }), { pemesanan: 0, pengadaan: 0, anggaran: 0 });

  XLSXStyle.utils.book_append_sheet(wb, sheet(
    "REKAP PER UNIT / DEPARTEMEN — SMK DUA MEI",
    ["No", "Unit / Departemen", "Pemesanan", "Pengadaan", "Total Pengajuan", "Total Anggaran", "% Anggaran"],
    deptEntries.map(([unit, d], i) => [
      i + 1, unit, d.pemesanan, d.pengadaan, d.pemesanan + d.pengadaan, fmtRp(d.anggaran),
      totalAnggaran > 0 ? Math.round((d.anggaran / totalAnggaran) * 100) + "%" : "0%",
    ]),
    [5], [0, 2, 3, 4, 6],
    ["", "TOTAL", deptTot.pemesanan, deptTot.pengadaan, deptTot.pemesanan + deptTot.pengadaan, fmtRp(deptTot.anggaran), "100%"],
    [5, 32, 14, 14, 16, 22, 12], H_DEPARTEMEN,
  ), "Per Departemen");

  // ── Sheet 5: Inventaris ───────────────────────────────────────────────────
  const wsInv = sheet(
    "REKAP INVENTARIS & STOK BARANG — SMK DUA MEI",
    ["No", "Nama Barang", "Kategori", "Stok", "Min Stok", "Satuan", "Harga Satuan", "Nilai Total", "Kondisi"],
    katalogList.map((b, i) => {
      const k = b.stok === 0 ? "Habis" : b.stok <= b.minStok ? "Menipis" : "Normal";
      return [i + 1, b.namaBarang, b.kategori, b.stok, b.minStok, b.satuan, fmtRp(b.hargaSatuan), fmtRp(b.stok * b.hargaSatuan), k];
    }),
    [6, 7], [0, 3, 4, 8],
    ["", "TOTAL NILAI INVENTARIS", "", "", "", "", "", fmtRp(nilaiInventaris), ""],
    [5, 30, 18, 8, 10, 10, 20, 20, 12], H_INVENTARIS,
  );
  katalogList.forEach((b, i) => {
    const k = b.stok === 0 ? "Habis" : b.stok <= b.minStok ? "Menipis" : "Normal";
    colorCell(wsInv, `I${i + 4}`, k === "Habis" ? RED : k === "Menipis" ? AMBER : GREEN);
  });
  XLSXStyle.utils.book_append_sheet(wb, wsInv, "Inventaris Stok");

  XLSXStyle.writeFile(wb, `Laporan_SMK_Dua_Mei_${new Date().toISOString().split("T")[0]}.xlsx`);
}
