import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const [kepalaSekolah, adminUser] = await Promise.all([
    prisma.user.findFirst({
      where: { role: "kepala_sekolah" },
      select: { nama: true, jabatan: true },
      orderBy: { nama: "asc" },
    }),
    prisma.user.findFirst({
      where: { role: { in: ["admin", "admin_it"] } },
      select: { nama: true, jabatan: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  return NextResponse.json({ kepalaSekolah, adminUser });
}
