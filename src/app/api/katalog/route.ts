import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(k: Record<string, unknown>) {
  return {
    ...k,
    createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : k.createdAt,
    updatedAt: k.updatedAt instanceof Date ? k.updatedAt.toISOString() : k.updatedAt,
  };
}

export async function GET() {
  const data = await prisma.katalogBarang.findMany({ orderBy: { namaBarang: "asc" } });
  return NextResponse.json(data.map(k => serialize(k as unknown as Record<string, unknown>)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.katalogBarang.create({ data: body });
  return NextResponse.json(serialize(created as unknown as Record<string, unknown>), { status: 201 });
}
