import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(n: Record<string, unknown>) {
  return {
    ...n,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}

export async function GET() {
  const data = await prisma.notifikasi.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data.map(n => serialize(n as unknown as Record<string, unknown>)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.notifikasi.create({ data: body });
  return NextResponse.json(serialize(created as unknown as Record<string, unknown>), { status: 201 });
}
