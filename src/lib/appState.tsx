"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FormPemesanan, FormPengadaan, Notifikasi, KatalogBarang } from "@/types";
import { authFetch } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

type Jenis = "pemesanan" | "pengadaan";

interface AppStateContextType {
  permintaanList: FormPemesanan[];
  pengadaanList: FormPengadaan[];
  notifikasiList: Notifikasi[];
  katalogList: KatalogBarang[];
  isLoading: boolean;
  submitPermintaan: (data: Omit<FormPemesanan, "id" | "nomorPesanan" | "status" | "createdAt" | "updatedAt">, namaPemohon: string) => Promise<string>;
  submitPengadaan: (data: Omit<FormPengadaan, "id" | "nomorPengadaan" | "status" | "createdAt" | "updatedAt">, namaPemohon: string) => Promise<string>;
  revisiPermintaan: (id: string, data: { keperluan: string; tanggalDibutuhkan: string; prioritas: "rendah" | "sedang" | "tinggi"; catatanPemesan?: string; barangList: FormPemesanan["barangList"] }, namaPemohon: string) => Promise<string>;
  setujuiItem: (id: string, jenis: Jenis, catatan: string, approverNama: string) => void;
  tolakItem: (id: string, jenis: Jenis, alasan: string, approverNama: string) => void;
  prosesItem: (id: string, jenis: Jenis) => void;
  selesaikanItem: (id: string, jenis: Jenis) => void;
  tandaiBacaNotif: (id: string) => void;
  tandaiSemuaBaca: () => void;
  hapusNotif: (id: string) => void;
  updateKatalogStok: (id: string, stokBaru: number) => void;
  updateKatalogItem: (id: string, data: Partial<KatalogBarang>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | null>(null);

function buatNotif(partial: Omit<Notifikasi, "id" | "sudahDibaca" | "createdAt">): Notifikasi {
  return {
    ...partial,
    id: `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sudahDibaca: false,
    createdAt: new Date().toISOString(),
  };
}

function patchApi(path: string, data: unknown) {
  authFetch(path, { method: "PATCH", body: JSON.stringify(data) });
}

function saveNotif(partial: Omit<Notifikasi, "id" | "sudahDibaca" | "createdAt">) {
  authFetch("/api/notifikasi", {
    method: "POST",
    body: JSON.stringify({ ...partial, sudahDibaca: false }),
  }).catch(() => {});
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [permintaanList, setPermintaanList] = useState<FormPemesanan[]>([]);
  const [pengadaanList, setPengadaanList] = useState<FormPengadaan[]>([]);
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [katalogList, setKatalogList] = useState<KatalogBarang[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const [pemRes, pgdRes, notifRes, katRes] = await Promise.allSettled([
        authFetch("/api/pemesanan"),
        authFetch("/api/pengadaan"),
        authFetch("/api/notifikasi"),
        authFetch("/api/katalog"),
      ]);
      if (pemRes.status === "fulfilled" && pemRes.value.ok) setPermintaanList(await pemRes.value.json());
      if (pgdRes.status === "fulfilled" && pgdRes.value.ok) setPengadaanList(await pgdRes.value.json());
      if (notifRes.status === "fulfilled" && notifRes.value.ok) setNotifikasiList(await notifRes.value.json());
      if (katRes.status === "fulfilled" && katRes.value.ok) setKatalogList(await katRes.value.json());
      setIsLoading(false);
    }
    loadAll();
  }, []);

  const addNotif = (...notifs: Notifikasi[]) =>
    setNotifikasiList((prev) => [...notifs, ...prev]);

  // ─── Submit ──────────────────────────────────────────────────────────────

  const submitPermintaan = async (
    data: Omit<FormPemesanan, "id" | "nomorPesanan" | "status" | "createdAt" | "updatedAt">,
    namaPemohon: string
  ): Promise<string> => {
    const res = await authFetch("/api/pemesanan", { method: "POST", body: JSON.stringify(data) });
    const newItem: FormPemesanan = await res.json();
    setPermintaanList((prev) => [newItem, ...prev]);

    const notif = {
      judul: "Permintaan Baru Menunggu Persetujuan",
      pesan: `${namaPemohon} (${data.unitDepartemen}) mengajukan pemesanan barang — ${data.keperluan}. Nomor: ${newItem.nomorPesanan}.`,
      tipe: "info" as const,
      targetRole: "kepala_sekolah" as const,
      nomorReferensi: newItem.nomorPesanan,
      jenisForm: "pemesanan" as const,
    };
    addNotif(buatNotif(notif));
    saveNotif(notif);
    return newItem.nomorPesanan;
  };

  const submitPengadaan = async (
    data: Omit<FormPengadaan, "id" | "nomorPengadaan" | "status" | "createdAt" | "updatedAt">,
    namaPemohon: string
  ): Promise<string> => {
    const res = await authFetch("/api/pengadaan", { method: "POST", body: JSON.stringify(data) });
    const newItem: FormPengadaan = await res.json();
    setPengadaanList((prev) => [newItem, ...prev]);

    const notif = {
      judul: "Pengajuan Pengadaan Baru",
      pesan: `${namaPemohon} (${data.unitDepartemen}) mengajukan pengadaan ${data.jenisBarang}. Nomor: ${newItem.nomorPengadaan}.`,
      tipe: "info" as const,
      targetRole: "kepala_sekolah" as const,
      nomorReferensi: newItem.nomorPengadaan,
      jenisForm: "pengadaan" as const,
    };
    addNotif(buatNotif(notif));
    saveNotif(notif);
    return newItem.nomorPengadaan;
  };

  const revisiPermintaan = async (
    id: string,
    data: { keperluan: string; tanggalDibutuhkan: string; prioritas: "rendah" | "sedang" | "tinggi"; catatanPemesan?: string; barangList: FormPemesanan["barangList"] },
    namaPemohon: string
  ): Promise<string> => {
    const res = await authFetch(`/api/pemesanan/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...data, status: "menunggu" }),
    });
    const updated: FormPemesanan = await res.json();
    setPermintaanList((prev) => prev.map((p) => p.id === id ? updated : p));

    const notif = {
      judul: "Revisi Pemesanan Dikirim",
      pesan: `${namaPemohon} telah merevisi pemesanan ${updated.nomorPesanan} dan mengirim ulang untuk persetujuan.`,
      tipe: "info" as const,
      targetRole: "kepala_sekolah" as const,
      nomorReferensi: updated.nomorPesanan,
      jenisForm: "pemesanan" as const,
    };
    addNotif(buatNotif(notif));
    saveNotif(notif);
    return updated.nomorPesanan;
  };

  // ─── Status updates ──────────────────────────────────────────────────────

  const updateStatus = (
    jenis: Jenis,
    id: string,
    updater: (p: FormPemesanan | FormPengadaan) => FormPemesanan | FormPengadaan
  ) => {
    const now = new Date().toISOString();
    if (jenis === "pemesanan") {
      setPermintaanList((prev) => prev.map((p) => p.id === id ? { ...updater(p), updatedAt: now } as FormPemesanan : p));
    } else {
      setPengadaanList((prev) => prev.map((p) => p.id === id ? { ...updater(p), updatedAt: now } as FormPengadaan : p));
    }
  };

  const setujuiItem = (id: string, jenis: Jenis, catatan: string, approverNama: string) => {
    let nomor = "", namaPemohon = "", perihal = "";

    updateStatus(jenis, id, (p) => {
      if (jenis === "pemesanan") {
        const pm = p as FormPemesanan;
        nomor = pm.nomorPesanan; namaPemohon = pm.namaPemesan; perihal = pm.keperluan;
      } else {
        const pg = p as FormPengadaan;
        nomor = pg.nomorPengadaan; namaPemohon = pg.namaPengaju; perihal = pg.jenisBarang;
      }
      return { ...p, status: "disetujui", catatanAdmin: catatan };
    });

    patchApi(`/api/${jenis}/${id}`, { status: "disetujui", catatanAdmin: catatan });

    const label = jenis === "pemesanan" ? "Pemesanan" : "Pengadaan";
    const n1 = buatNotif({ judul: `${label} Disetujui`, pesan: `Permintaan Anda (${nomor}) telah disetujui oleh ${approverNama}.${catatan ? ` Catatan: ${catatan}` : ""}`, tipe: "sukses", targetRole: "pemohon", nomorReferensi: nomor, jenisForm: jenis });
    const n2 = buatNotif({ judul: `${label} Disetujui — Siap Diproses`, pesan: `${namaPemohon} — ${perihal} (${nomor}) telah disetujui.`, tipe: "info", targetRole: "admin", nomorReferensi: nomor, jenisForm: jenis });
    addNotif(n1, n2);
    saveNotif(n1); saveNotif(n2);
  };

  const tolakItem = (id: string, jenis: Jenis, alasan: string, approverNama: string) => {
    let nomor = "";

    updateStatus(jenis, id, (p) => {
      nomor = jenis === "pemesanan" ? (p as FormPemesanan).nomorPesanan : (p as FormPengadaan).nomorPengadaan;
      return { ...p, status: "ditolak", catatanAdmin: alasan };
    });

    patchApi(`/api/${jenis}/${id}`, { status: "ditolak", catatanAdmin: alasan });

    const label = jenis === "pemesanan" ? "Pemesanan" : "Pengadaan";
    const n = buatNotif({ judul: `${label} Ditolak`, pesan: `Permintaan Anda (${nomor}) ditolak oleh ${approverNama}. Alasan: ${alasan}`, tipe: "ditolak", targetRole: "pemohon", nomorReferensi: nomor, jenisForm: jenis });
    addNotif(n); saveNotif(n);
  };

  const prosesItem = (id: string, jenis: Jenis) => {
    updateStatus(jenis, id, (p) => ({ ...p, status: "diproses" }));
    patchApi(`/api/${jenis}/${id}`, { status: "diproses" });
  };

  const selesaikanItem = (id: string, jenis: Jenis) => {
    let nomor = "";

    updateStatus(jenis, id, (p) => {
      nomor = jenis === "pemesanan" ? (p as FormPemesanan).nomorPesanan : (p as FormPengadaan).nomorPengadaan;
      return { ...p, status: "selesai" };
    });

    patchApi(`/api/${jenis}/${id}`, { status: "selesai" });

    const label = jenis === "pemesanan" ? "Pemesanan" : "Pengadaan";
    const n = buatNotif({ judul: `${label} Selesai`, pesan: `Permintaan (${nomor}) telah selesai diproses. Barang siap diserahkan.`, tipe: "sukses", targetRole: "pemohon", nomorReferensi: nomor, jenisForm: jenis });
    addNotif(n); saveNotif(n);
  };

  // ─── Notifikasi ──────────────────────────────────────────────────────────

  const tandaiBacaNotif = (id: string) => {
    setNotifikasiList((prev) => prev.map((n) => n.id === id ? { ...n, sudahDibaca: true } : n));
    patchApi(`/api/notifikasi/${id}`, { sudahDibaca: true });
  };

  const tandaiSemuaBaca = () => {
    setNotifikasiList((prev) => {
      prev.filter((n) => !n.sudahDibaca).forEach((n) => patchApi(`/api/notifikasi/${n.id}`, { sudahDibaca: true }));
      return prev.map((n) => ({ ...n, sudahDibaca: true }));
    });
  };

  const hapusNotif = (id: string) => {
    setNotifikasiList((prev) => prev.filter((n) => n.id !== id));
    authFetch(`/api/notifikasi/${id}`, { method: "DELETE" });
  };

  // ─── Katalog ─────────────────────────────────────────────────────────────

  const updateKatalogStok = (id: string, stokBaru: number) => {
    setKatalogList((prev) => prev.map((k) => k.id === id ? { ...k, stok: stokBaru } : k));
    patchApi(`/api/katalog/${id}`, { stok: stokBaru });
  };

  const updateKatalogItem = (id: string, data: Partial<KatalogBarang>) => {
    setKatalogList((prev) => prev.map((k) => k.id === id ? { ...k, ...data } : k));
    patchApi(`/api/katalog/${id}`, data);
  };

  return (
    <AppStateContext.Provider value={{
      permintaanList, pengadaanList, notifikasiList, katalogList, isLoading,
      submitPermintaan, submitPengadaan, revisiPermintaan,
      setujuiItem, tolakItem, prosesItem, selesaikanItem,
      tandaiBacaNotif, tandaiSemuaBaca, hapusNotif,
      updateKatalogStok, updateKatalogItem,
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
