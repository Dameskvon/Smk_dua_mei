import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { serialize, ok } from "@/lib/apiUtils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const data = await prisma.notifikasi.findMany({ orderBy: { createdAt: "desc" } });
  return ok(data.map((n) => serialize(n as never)));
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json();
  const created = await prisma.notifikasi.create({ data: body });
  return ok(serialize(created as never), 201);
}
