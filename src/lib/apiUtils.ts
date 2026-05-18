import { NextResponse } from "next/server";

type Row = Record<string, unknown>;

export function serialize(row: Row): Row {
  return {
    ...row,
    ...(row.createdAt instanceof Date && { createdAt: row.createdAt.toISOString() }),
    ...(row.updatedAt instanceof Date && { updatedAt: row.updatedAt.toISOString() }),
  };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
