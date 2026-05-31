import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.approvalStep.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.barangItem.deleteMany();
  await prisma.pemesanan.deleteMany();
  await prisma.pengadaan.deleteMany();
  await prisma.katalogBarang.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seed selesai!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
