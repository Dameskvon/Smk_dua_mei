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
  const data = await prisma.pemesanan.findMany({
    include: { barangList: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data.map(serialize));
}

export async function POST(req: Request) {
  const body = await req.json();
  const count = await prisma.pemesanan.count();
  const tahun = new Date().getFullYear();
  const nomor = `PES/${tahun}/${String(count + 1).padStart(3, "0")}`;

  const { barangList, ...rest } = body;
  const created = await prisma.pemesanan.create({
    data: {
      ...rest,
      nomorPesanan: nomor,
      status: "menunggu",
      barangList: {
        create: (barangList as Array<{ namaBarang: string; jumlah: number; satuan: string; keterangan?: string; hargaSatuan?: number }>).map(
          ({ namaBarang, jumlah, satuan, keterangan, hargaSatuan }) => ({
            namaBarang, jumlah, satuan, keterangan, hargaSatuan,
          })
        ),
      },
    },
    include: { barangList: true },
  });
  return NextResponse.json(serialize(created as unknown as Record<string, unknown>), { status: 201 });
}
