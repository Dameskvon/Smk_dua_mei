import { NextRequest, NextResponse } from "next/server";

export type ApiUser = {
  id: string;
  username: string;
  role: string;
};

// Baca session dari header Authorization: Bearer <base64(JSON)>
export function getSessionUser(req: NextRequest | Request): ApiUser | null {
  const auth = (req as NextRequest).headers?.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const decoded = Buffer.from(auth.slice(7), "base64").toString("utf-8");
    return JSON.parse(decoded) as ApiUser;
  } catch {
    return null;
  }
}

export function requireAuth(
  req: NextRequest | Request,
  allowedRoles?: string[]
): { user: ApiUser } | NextResponse {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { user };
}
