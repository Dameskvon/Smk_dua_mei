import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }
  const { password: _pw, createdAt, updatedAt, ...userData } = user;
  void _pw;
  return NextResponse.json(userData);
}
