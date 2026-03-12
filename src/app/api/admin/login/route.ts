import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  // Kamu bisa ganti password-nya di sini
  if (password === "admin123") {
    const response = NextResponse.json({ message: "Login Berhasil" });
    
    // Memberikan cookie 'admin_token' yang berlaku selama 24 jam
    response.cookies.set("admin_token", "rahasia_guru_2026", {
      httpOnly: true, // Aman dari hacker lewat browser console
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ message: "Password Salah!" }, { status: 401 });
}