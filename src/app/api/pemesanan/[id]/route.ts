import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["menunggu", "diproses", "disetujui", "ditolak", "selesai", "revisi"]).optional(),
  catatanAdmin: z.string().max(500).optional(),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]).optional(),
  keperluan: z.string().min(1).optional(),
  tanggalDibutuhkan: z.string().optional(),
  catatanPemesan: z.string().optional(),
  barangList: z.array(z.object({
    namaBarang: z.string().min(1),
    jumlah: z.number().int().positive(),
    satuan: z.string().min(1),
    keterangan: z.string().optional(),
  })).optional(),
});

function serialize(p: Record<string, unknown>) {
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { barangList, ...rest } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.pemesanan.update({
      where: { id },
      data: rest,
      include: { barangList: true },
    });
    if (barangList) {
      await tx.barangItem.deleteMany({ where: { pemesananId: id } });
      await tx.barangItem.createMany({
        data: barangList.map((b) => ({ ...b, pemesananId: id })),
      });
      const fresh = await tx.pemesanan.findUnique({ where: { id }, include: { barangList: true } });
      return fresh!;
    }
    return p;
  });

  return NextResponse.json(serialize(updated as unknown as Record<string, unknown>));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin", "admin_it"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  await prisma.pemesanan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
