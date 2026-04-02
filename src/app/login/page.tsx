"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Jika sukses, kirim admin ke halaman dashboard
        router.push("/admin");
        router.refresh(); 
      } else {
        setError("Password yang kamu masukkan salah, coba lagi ya!");
      }
    } catch {
      setError("Duh, sepertinya ada masalah koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="card w-full max-w-sm shadow-xl border-t-4 border-t-primary">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Login Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Gunakan password khusus guru</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
  {/* Ikon Kunci di Kiri */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>

            {/* Input Password dengan Efek Glow */}
            <input
                type="password"
                required
                className={`block w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl text-lg tracking-[0.3em] font-bold transition-all duration-300 
                ${error 
                    ? 'border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 shadow-sm' 
                    : 'border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm hover:border-slate-200'
                } placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300 outline-none`}
                placeholder="Ketik kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* Garis Dekorasi di Bawah (Opsional tapi keren) */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-primary rounded-t-full transition-all duration-500 ${password.length > 0 ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}></div>
            </div>

          <button 
            type="submit" 
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Mengecek...
              </>
            ) : "Buka Panel Dashboard"}
          </button>
        </form>

        <button 
          onClick={() => router.push("/")}
          className="w-full mt-6 text-sm text-slate-400 hover:text-primary transition-colors"
        >
          ← Kembali ke Halaman Siswa
        </button>
      </div>
    </div>
  );
}