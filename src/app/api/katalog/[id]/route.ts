import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { serialize, ok } from "@/lib/apiUtils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin", "admin_it"]);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.katalogBarang.update({ where: { id }, data: body });
  return ok(serialize(updated as never));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["admin", "admin_it"]);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  await prisma.katalogBarang.delete({ where: { id } });
  return ok({ ok: true });
}
