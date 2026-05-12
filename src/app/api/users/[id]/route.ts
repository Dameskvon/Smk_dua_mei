import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nama, jabatan, unitDepartemen, role, password } = await req.json();
  const updated = await prisma.user.update({
    where: { id },
    data: { nama, jabatan, unitDepartemen, role, ...(password ? { password } : {}) },
  });
  const { password: _pw, createdAt, updatedAt, ...userData } = updated;
  void _pw; void createdAt; void updatedAt;
  return NextResponse.json(userData);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
