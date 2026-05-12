import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(k: Record<string, unknown>) {
  return {
    ...k,
    createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : k.createdAt,
    updatedAt: k.updatedAt instanceof Date ? k.updatedAt.toISOString() : k.updatedAt,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.katalogBarang.update({ where: { id }, data: body });
  return NextResponse.json(serialize(updated as unknown as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.katalogBarang.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
