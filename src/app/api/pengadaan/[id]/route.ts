import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { serialize, ok, err } from "@/lib/apiUtils";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["menunggu", "diproses", "disetujui", "ditolak", "selesai", "revisi"]).optional(),
  catatanAdmin: z.string().max(500).optional(),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin", "admin_it", "kepala_sekolah"]);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return err("Input tidak valid", 400);

  const updated = await prisma.pengadaan.update({ where: { id }, data: parsed.data });
  return ok(serialize(updated as never));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin", "admin_it"]);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  await prisma.pengadaan.delete({ where: { id } });
  return ok({ ok: true });
}
