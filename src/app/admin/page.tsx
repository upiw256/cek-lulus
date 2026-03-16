"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Import komponen hasil slicing kita
import Sidebar from "@/components/admin/Sidebar";
import StatCard from "@/components/admin/StatCard";
import UploadBox from "@/components/admin/UploadBox";
import TableSiswa from "@/components/admin/TableSiswa";
import SettingPage from "@/components/admin/SettingPage";

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- STATE UTAMA ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // --- STATE DATA & UPLOAD ---
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 1200, lulus: 1200, tunda: 0 });

  const [allSiswa, setAllSiswa] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSiswa = async () => {
  const res = await fetch("/api/admin/siswa");
  const data = await res.json();
  if (res.ok) setAllSiswa(data);
  };

  useEffect(() => {
  if (activeTab === "siswa") fetchSiswa();
  }, [activeTab]);

  const filteredSiswa = allSiswa.filter((s: any) => 
  s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
  s.nisn.includes(searchQuery)
  );

  // Menu navigasi sidebar
  const menus = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "upload", name: "Import Excel", icon: "📁" },
    { id: "tte", name: "Tanda Tangan (TTE)", icon: "✍️" },
    { id: "siswa", name: "Data Siswa", icon: "👥" },
    { id: "settings", name: "Pengaturan", icon: "⚙️" },
  ];

  // --- FUNGSI LOGOUT ---
  const handleLogout = async () => {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    if (res.ok) {
      router.push("/login");
      router.refresh();
    }
  };

  // --- FUNGSI UPLOAD EXCEL ---
  const handleUploadExcel = async () => {
    if (!uploadFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Berhasil: " + result.message);
        setUploadFile(null);
        // Opsional: Refresh data statistik di sini
      } else {
        alert("❌ Gagal: " + result.error);
      }
    } catch (err) {
      alert("❌ Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 relative">
      {/* 1. OVERLAY (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* 2. SIDEBAR (Komponen Slicing) */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          menus={menus}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      {/* 3. AREA KONTEN UTAMA */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* TOPBAR / HEADER */}
        <header className="bg-white border-b border-slate-200 p-4 lg:p-8 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-50 rounded-lg"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-slate-800 leading-tight">
                {menus.find((m) => m.id === activeTab)?.name}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Admin Panel CekLulus
              </p>
            </div>
          </div>

          {/* Menu Profil & Logout */}
          <div className="flex items-center gap-3 relative">
            <div className="text-right hidden md:block text-xs lg:text-sm">
              <p className="font-bold text-slate-700">Admin Utama</p>
              <p className="text-green-500 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
                Online
              </p>
            </div>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full font-bold shadow-md active:scale-90 transition-all"
            >
              A
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 font-semibold"
                  >
                    🚪 Keluar Aplikasi
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ISI KONTEN BERDASARKAN TAB */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* TAB DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <StatCard title="Total Siswa" value={stats.total} color="blue" />
              <StatCard title="Lulus" value={stats.lulus} color="green" />
              <StatCard title="Tertunda" value={stats.tunda} color="orange" />
            </div>
          )}

          {/* TAB UPLOAD (Komponen Slicing) */}
          {activeTab === "upload" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <UploadBox
                file={uploadFile}
                setFile={setUploadFile}
                onUpload={handleUploadExcel}
                loading={loading}
              />
            </div>
          )}

          {activeTab === "siswa" && (
            <TableSiswa data={allSiswa} onRefresh={fetchSiswa} />
          )}
          {activeTab === "settings" && <SettingPage />}

          {/* TAB LAINNYA (Coming Soon) */}
          {activeTab === "tte" && (
            <div className="card text-center p-20 opacity-50 border-dashed border-2">
              <p className="text-slate-400">
                Fitur {menus.find((m) => m.id === activeTab)?.name} sedang
                dikembangkan...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}