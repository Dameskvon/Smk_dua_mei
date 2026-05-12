import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(p: Record<string, unknown>) {
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

export async function GET() {
  const data = await prisma.pengadaan.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data.map(p => serialize(p as unknown as Record<string, unknown>)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const count = await prisma.pengadaan.count();
  const tahun = new Date().getFullYear();
  const nomor = `PGD/${tahun}/${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.pengadaan.create({
    data: { ...body, nomorPengadaan: nomor, status: "menunggu" },
  });
  return NextResponse.json(serialize(created as unknown as Record<string, unknown>), { status: 201 });
}
