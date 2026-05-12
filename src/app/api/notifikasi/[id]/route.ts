import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(n: Record<string, unknown>) {
  return {
    ...n,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.notifikasi.update({ where: { id }, data: body });
  return NextResponse.json(serialize(updated as unknown as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.notifikasi.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
