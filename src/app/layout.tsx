import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Mengatur Font Geist agar tampilan teks terlihat profesional
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Judul website yang muncul di tab browser
export const metadata: Metadata = {
  title: "Sistem Kelulusan Siswa v1.0",
  description: "Cek hasil kelulusan siswa dengan aman dan cepat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Konten utama website akan muncul di sini */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Footer sederhana untuk internal sekolah */}
        <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 bg-white">
          &copy; 2026 Sistem Kelulusan Internal v1.0
        </footer>
      </body>
    </html>
  );
}