import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(p: Record<string, unknown>) {
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.pengadaan.update({ where: { id }, data: body });
  return NextResponse.json(serialize(updated as unknown as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.pengadaan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
