import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(1).max(100),
});

// Rate limiting sederhana: simpan IP + jumlah percobaan di memory
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

export async function POST(req: Request) {
  // Rate limiting
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const record = attempts.get(ip);

  if (record) {
    if (now < record.resetAt) {
      if (record.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
          { status: 429 }
        );
      }
      record.count++;
    } else {
      attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  // Validasi input
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { username, password } = parsed.data;

  // Cari user
  const user = await prisma.user.findUnique({ where: { username } });

  // Gunakan bcrypt compare — jika password belum di-hash, fallback ke plain text (migrasi bertahap)
  let valid = false;
  if (user) {
    const isHashed = user.password.startsWith("$2");
    if (isHashed) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      // Password lama masih plain text — cek lalu hash ulang
      valid = user.password === password;
      if (valid) {
        const hashed = await bcrypt.hash(password, 12);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      }
    }
  }

  if (!user || !valid) {
    // Delay untuk mencegah timing attack
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  // Reset percobaan setelah login berhasil
  attempts.delete(ip);

  const { password: _pw, createdAt, updatedAt, ...userData } = user;
  void _pw; void createdAt; void updatedAt;

  return NextResponse.json(userData);
}
