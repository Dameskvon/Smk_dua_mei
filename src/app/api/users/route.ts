import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.user.findMany({ orderBy: { nama: "asc" } });
  return NextResponse.json(data.map(({ password: _pw, createdAt, updatedAt, ...u }) => {
    void _pw; void createdAt; void updatedAt;
    return u;
  }));
}

export async function POST(req: Request) {
  const { nama, username, jabatan, unitDepartemen, role } = await req.json();
  const created = await prisma.user.create({
    data: { nama, username, jabatan, unitDepartemen, role, password: username },
  });
  const { password: _pw, createdAt, updatedAt, ...userData } = created;
  void _pw; void createdAt; void updatedAt;
  return NextResponse.json(userData, { status: 201 });
}
