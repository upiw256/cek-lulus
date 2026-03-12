import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout Berhasil" });
  
  // Menghapus cookie dengan mengatur masa berlakunya ke masa lalu
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}