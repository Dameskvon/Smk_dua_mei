import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { z } from "zod";

const barangSchema = z.object({
  namaBarang: z.string().min(1).max(100),
  jumlah: z.number().int().positive(),
  satuan: z.string().min(1).max(30),
  keterangan: z.string().max(500).optional(),
  hargaSatuan: z.number().int().nonnegative().optional(),
});

const pemesananSchema = z.object({
  tanggalPesan: z.string().min(1),
  namaPemesan: z.string().min(1).max(100),
  jabatan: z.string().min(1).max(100),
  unitDepartemen: z.string().min(1).max(100),
  keperluan: z.string().min(1).max(1000),
  tanggalDibutuhkan: z.string().min(1),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]),
  catatanPemesan: z.string().max(500).optional(),
  userId: z.string().optional(),
  barangList: z.array(barangSchema).min(1),
});

function serialize(p: Record<string, unknown>) {
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.pemesanan.findMany({
    include: { barangList: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data.map(serialize));
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = pemesananSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { barangList, ...rest } = parsed.data;
  const count = await prisma.pemesanan.count();
  const tahun = new Date().getFullYear();
  const nomor = `PES/${tahun}/${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.pemesanan.create({
    data: {
      ...rest,
      nomorPesanan: nomor,
      status: "menunggu",
      barangList: { create: barangList },
    },
    include: { barangList: true },
  });

  return NextResponse.json(serialize(created as unknown as Record<string, unknown>), { status: 201 });
}
