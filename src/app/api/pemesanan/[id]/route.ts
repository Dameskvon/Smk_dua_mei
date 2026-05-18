import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["menunggu", "diproses", "disetujui", "ditolak", "selesai", "revisi"]).optional(),
  catatanAdmin: z.string().max(500).optional(),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]).optional(),
});

function serialize(p: Record<string, unknown>) {
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin", "admin_it", "kepala_sekolah"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const updated = await prisma.pemesanan.update({
    where: { id },
    data: parsed.data,
    include: { barangList: true },
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
