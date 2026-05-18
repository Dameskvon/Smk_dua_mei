import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  nama: z.string().min(1).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  jabatan: z.string().min(1).max(100),
  unitDepartemen: z.string().min(1).max(100),
  role: z.enum(["guru", "kepala_sekolah", "admin", "admin_it"]),
  password: z.string().min(6).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["admin", "admin_it"]);
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.user.findMany({ orderBy: { nama: "asc" } });
  return NextResponse.json(
    data.map(({ password: _pw, createdAt, updatedAt, ...u }) => {
      void _pw; void createdAt; void updatedAt;
      return u;
    })
  );
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["admin_it"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { nama, username, jabatan, unitDepartemen, role, password } = parsed.data;

  // Cek username sudah ada
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
  }

  // Hash password — default: username jika tidak diisi
  const rawPassword = password ?? username;
  const hashed = await bcrypt.hash(rawPassword, 12);

  const created = await prisma.user.create({
    data: { nama, username, jabatan, unitDepartemen, role, password: hashed },
  });

  const { password: _pw, createdAt, updatedAt, ...userData } = created;
  void _pw; void createdAt; void updatedAt;
  return NextResponse.json(userData, { status: 201 });
}
