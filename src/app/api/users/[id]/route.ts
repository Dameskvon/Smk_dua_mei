import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const patchSchema = z.object({
  nama: z.string().min(1).max(100).optional(),
  jabatan: z.string().min(1).max(100).optional(),
  unitDepartemen: z.string().min(1).max(100).optional(),
  role: z.enum(["guru", "kepala_sekolah", "admin", "admin_it"]).optional(),
  password: z.string().min(6).max(100).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin_it"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({ where: { id }, data: updateData });
  const { password: _pw, createdAt, updatedAt, ...userData } = updated;
  void _pw; void createdAt; void updatedAt;
  return NextResponse.json(userData);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin_it"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  // Cegah hapus diri sendiri
  if (auth.user.id === id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
