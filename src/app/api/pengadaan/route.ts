import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { serialize, ok, err } from "@/lib/apiUtils";
import { z } from "zod";

const pengadaanSchema = z.object({
  tanggalPengadaan: z.string().min(1),
  namaPengaju: z.string().min(1).max(100),
  jabatan: z.string().min(1).max(100),
  unitDepartemen: z.string().min(1).max(100),
  jenisBarang: z.string().min(1).max(100),
  spesifikasi: z.string().min(1).max(1000),
  jumlah: z.number().int().positive(),
  satuan: z.string().min(1).max(30),
  estimasiHarga: z.number().int().nonnegative(),
  tujuanPengadaan: z.string().min(1).max(1000),
  sumberDana: z.string().min(1).max(100),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]),
  catatanPengaju: z.string().max(500).optional(),
  userId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const data = await prisma.pengadaan.findMany({ orderBy: { createdAt: "desc" } });
  return ok(data.map((p) => serialize(p as never)));
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => null);
  const parsed = pengadaanSchema.safeParse(body);
  if (!parsed.success) return err("Input tidak valid", 400);

  const count = await prisma.pengadaan.count();
  const nomor = `PGD/${new Date().getFullYear()}/${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.pengadaan.create({
    data: { ...parsed.data, nomorPengadaan: nomor, status: "menunggu" },
  });
  return ok(serialize(created as never), 201);
}
