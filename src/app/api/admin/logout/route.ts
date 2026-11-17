import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/src/utils/adminSession";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
