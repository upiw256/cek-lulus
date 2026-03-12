import { NextResponse } from "next/server";

export async function GET() {
  // Bikin angka acak 1-10
  const angka1 = Math.floor(Math.random() * 10) + 1;
  const angka2 = Math.floor(Math.random() * 10) + 1;
  
  const hasil = angka1 + angka2;
  const pertanyaan = `Berapa ${angka1} + ${angka2} ?`;

  const response = NextResponse.json({ 
    question: pertanyaan 
  });
  
  // Simpan jawaban (hasil pertambahan) di cookie
  response.cookies.set("captcha_text", hasil.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 2,
    path: "/",
  });

  return response;
}