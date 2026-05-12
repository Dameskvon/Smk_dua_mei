import { PrismaClient } from "@/generated/prisma/client";

// Singleton pattern: pastikan hanya ada 1 koneksi database
// (penting saat Next.js hot reload di development)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
