import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { serialize, ok } from "@/lib/apiUtils";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const data = await prisma.katalogBarang.findMany({ orderBy: { namaBarang: "asc" } });
  return ok(data.map((k: unknown) => serialize(k as never)));
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["admin", "admin_it"]);
  if (auth instanceof Response) return auth;

  const body = await req.json();
  const created = await prisma.katalogBarang.create({ data: body });
  return ok(serialize(created as never), 201);
}
