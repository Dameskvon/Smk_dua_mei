"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FormPemesanan, FormPengadaan, Notifikasi, KatalogBarang } from "@/types";

interface AppStateContextType {
  permintaanList: FormPemesanan[];
  pengadaanList: FormPengadaan[];
  notifikasiList: Notifikasi[];
  katalogList: KatalogBarang[];
  isLoading: boolean;

  submitPermintaan: (
    data: Omit<FormPemesanan, "id" | "nomorPesanan" | "status" | "createdAt" | "updatedAt">,
    namaPemohon: string
  ) => Promise<string>;

  submitPengadaan: (
    data: Omit<FormPengadaan, "id" | "nomorPengadaan" | "status" | "createdAt" | "updatedAt">,
    namaPemohon: string
  ) => Promise<string>;

  setujuiItem: (id: string, jenis: "pemesanan" | "pengadaan", catatan: string, approverNama: string) => void;
  tolakItem: (id: string, jenis: "pemesanan" | "pengadaan", alasan: string, approverNama: string) => void;
  prosesItem: (id: string, jenis: "pemesanan" | "pengadaan") => void;
  selesaikanItem: (id: string, jenis: "pemesanan" | "pengadaan") => void;

  tandaiBacaNotif: (id: string) => void;
  tandaiSemuaBaca: () => void;
  hapusNotif: (id: string) => void;

  updateKatalogStok: (id: string, stokBaru: number) => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

function buatNotif(partial: Omit<Notifikasi, "id" | "sudahDibaca" | "createdAt">): Notifikasi {
  return {
    ...partial,
    id: `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sudahDibaca: false,
    createdAt: new Date().toISOString(),
  };
}

async function saveNotif(partial: Omit<Notifikasi, "id" | "sudahDibaca" | "createdAt">) {
  try {
    await fetch("/api/notifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...partial, sudahDibaca: false }),
    });
  } catch { /* fire-and-forget */ }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [permintaanList, setPermintaanList] = useState<FormPemesanan[]>([]);
  const [pengadaanList, setPengadaanList] = useState<FormPengadaan[]>([]);
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [katalogList, setKatalogList] = useState<KatalogBarang[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [pemRes, pgdRes, notifRes, katRes] = await Promise.all([
          fetch("/api/pemesanan"),
          fetch("/api/pengadaan"),
          fetch("/api/notifikasi"),
          fetch("/api/katalog"),
        ]);
        if (pemRes.ok) setPermintaanList(await pemRes.json());
        if (pgdRes.ok) setPengadaanList(await pgdRes.json());
        if (notifRes.ok) setNotifikasiList(await notifRes.json());
        if (katRes.ok) setKatalogList(await katRes.json());
      } catch { /* keep mock data on error */ }
      setIsLoading(false);
    }
    loadAll();
  }, []);

  const addNotif = (...notifs: Notifikasi[]) =>
    setNotifikasiList((prev) => [...notifs, ...prev]);

  const submitPermintaan = async (
    data: Omit<FormPemesanan, "id" | "nomorPesanan" | "status" | "createdAt" | "updatedAt">,
    namaPemohon: string
  ): Promise<string> => {
    const res = await fetch("/api/pemesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newItem: FormPemesanan = await res.json();
    setPermintaanList((prev) => [newItem, ...prev]);

    const notifData = {
      judul: "Permintaan Baru Menunggu Persetujuan",
      pesan: `${namaPemohon} (${data.unitDepartemen}) mengajukan permintaan pemesanan barang — ${data.keperluan}. Nomor: ${newItem.nomorPesanan}.`,
      tipe: "info" as const,
      targetRole: "kepala_sekolah" as const,
      nomorReferensi: newItem.nomorPesanan,
      jenisForm: "pemesanan" as const,
    };
    addNotif(buatNotif(notifData));
    saveNotif(notifData);
    return newItem.nomorPesanan;
  };

  const submitPengadaan = async (
    data: Omit<FormPengadaan, "id" | "nomorPengadaan" | "status" | "createdAt" | "updatedAt">,
    namaPemohon: string
  ): Promise<string> => {
    const res = await fetch("/api/pengadaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newItem: FormPengadaan = await res.json();
    setPengadaanList((prev) => [newItem, ...prev]);

    const notifData = {
      judul: "Pengajuan Pengadaan Baru",
      pesan: `${namaPemohon} (${data.unitDepartemen}) mengajukan pengadaan ${data.jenisBarang} — ${data.tujuanPengadaan}. Nomor: ${newItem.nomorPengadaan}.`,
      tipe: "info" as const,
      targetRole: "kepala_sekolah" as const,
      nomorReferensi: newItem.nomorPengadaan,
      jenisForm: "pengadaan" as const,
    };
    addNotif(buatNotif(notifData));
    saveNotif(notifData);
    return newItem.nomorPengadaan;
  };

  const setujuiItem = (id: string, jenis: "pemesanan" | "pengadaan", catatan: string, approverNama: string) => {
    const now = new Date().toISOString();
    let nomor = "", namaPemohon = "", perihal = "";

    if (jenis === "pemesanan") {
      setPermintaanList((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        nomor = p.nomorPesanan; namaPemohon = p.namaPemesan; perihal = p.keperluan;
        return { ...p, status: "disetujui", catatanAdmin: catatan, updatedAt: now };
      }));
      fetch(`/api/pemesanan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "disetujui", catatanAdmin: catatan }) });
    } else {
      setPengadaanList((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        nomor = p.nomorPengadaan; namaPemohon = p.namaPengaju; perihal = p.jenisBarang;
        return { ...p, status: "disetujui", catatanAdmin: catatan, updatedAt: now };
      }));
      fetch(`/api/pengadaan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "disetujui", catatanAdmin: catatan }) });
    }

    const n1 = buatNotif({ judul: `${jenis === "pemesanan" ? "Pemesanan" : "Pengadaan"} Disetujui`, pesan: `Permintaan Anda (${nomor}) telah disetujui oleh ${approverNama}. ${catatan ? `Catatan: ${catatan}` : ""}`, tipe: "sukses", targetRole: "pemohon", nomorReferensi: nomor, jenisForm: jenis });
    const n2 = buatNotif({ judul: "Permintaan Disetujui — Siap Diproses", pesan: `${namaPemohon} — ${perihal} (${nomor}) telah disetujui. Silakan proses pengadaan barang.`, tipe: "info", targetRole: "admin", nomorReferensi: nomor, jenisForm: jenis });
    addNotif(n1, n2);
    saveNotif(n1); saveNotif(n2);
  };

  const tolakItem = (id: string, jenis: "pemesanan" | "pengadaan", alasan: string, approverNama: string) => {
    const now = new Date().toISOString();
    let nomor = "";

    if (jenis === "pemesanan") {
      setPermintaanList((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        nomor = p.nomorPesanan;
        return { ...p, status: "ditolak", catatanAdmin: alasan, updatedAt: now };
      }));
      fetch(`/api/pemesanan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ditolak", catatanAdmin: alasan }) });
    } else {
      setPengadaanList((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        nomor = p.nomorPengadaan;
        return { ...p, status: "ditolak", catatanAdmin: alasan, updatedAt: now };
      }));
      fetch(`/api/pengadaan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ditolak", catatanAdmin: alasan }) });
    }

    const n = buatNotif({ judul: `${jenis === "pemesanan" ? "Pemesanan" : "Pengadaan"} Ditolak`, pesan: `Permintaan Anda (${nomor}) ditolak oleh ${approverNama}. Alasan: ${alasan}`, tipe: "ditolak", targetRole: "pemohon", nomorReferensi: nomor, jenisForm: jenis });
    addNotif(n); saveNotif(n);
  };

  const prosesItem = (id: string, jenis: "pemesanan" | "pengadaan") => {
    const now = new Date().toISOString();
    if (jenis === "pemesanan") {
      setPermintaanList((prev) => prev.map((p) => p.id === id ? { ...p, status: "diproses", updatedAt: now } : p));
      fetch(`/api/pemesanan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "diproses" }) });
    } else {
      setPengadaanList((prev) => prev.map((p) => p.id === id ? { ...p, status: "diproses", updatedAt: now } : p));
      fetch(`/api/pengadaan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "diproses" }) });
    }
  };

  const selesaikanItem = (id: string, jenis: "pemesanan" | "pengadaan") => {
    const now = new Date().toISOString();
    let nomor = "";

    if (jenis === "pemesanan") {
      setPermintaanList((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        nomor = p.nomorPesanan;
        return { ...p, status: "selesai", updatedAt: now };
      }));
      fetch(`/api/pemesanan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "selesai" }) });
    } else {
      setPengadaanList((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        nomor = p.nomorPengadaan;
        return { ...p, status: "selesai", updatedAt: now };
      }));
      fetch(`/api/pengadaan/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "selesai" }) });
    }

    const n = buatNotif({ judul: `${jenis === "pemesanan" ? "Pemesanan" : "Pengadaan"} Selesai`, pesan: `Permintaan (${nomor}) telah selesai diproses. Barang siap diserahkan.`, tipe: "sukses", targetRole: "pemohon", nomorReferensi: nomor, jenisForm: jenis });
    addNotif(n); saveNotif(n);
  };

  const tandaiBacaNotif = (id: string) => {
    setNotifikasiList((prev) => prev.map((n) => n.id === id ? { ...n, sudahDibaca: true } : n));
    fetch(`/api/notifikasi/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sudahDibaca: true }) });
  };

  const tandaiSemuaBaca = () => {
    setNotifikasiList((prev) => prev.map((n) => ({ ...n, sudahDibaca: true })));
    notifikasiList.filter((n) => !n.sudahDibaca).forEach((n) => {
      fetch(`/api/notifikasi/${n.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sudahDibaca: true }) });
    });
  };

  const hapusNotif = (id: string) => {
    setNotifikasiList((prev) => prev.filter((n) => n.id !== id));
    fetch(`/api/notifikasi/${id}`, { method: "DELETE" });
  };

  const updateKatalogStok = (id: string, stokBaru: number) => {
    setKatalogList((prev) => prev.map((k) => k.id === id ? { ...k, stok: stokBaru } : k));
    fetch(`/api/katalog/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stok: stokBaru }) });
  };

  return (
    <AppStateContext.Provider value={{
      permintaanList, pengadaanList, notifikasiList, katalogList, isLoading,
      submitPermintaan, submitPengadaan,
      setujuiItem, tolakItem, prosesItem, selesaikanItem,
      tandaiBacaNotif, tandaiSemuaBaca, hapusNotif,
      updateKatalogStok,
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
