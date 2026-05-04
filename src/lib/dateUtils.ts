/**
 * Menormalisasi string tanggal ke format DD/MM/YYYY
 * Mendukung format YYYY-MM-DD, DD-MM-YYYY, atau format tanggal JS standar (misal: "04 Apr 2008")
 */
export function normalizeDateIndo(dateStr: string): string {
  if (!dateStr) return "";

  // 1. Coba parsing dengan native Date (handal untuk format ISO atau format teks standar)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // 2. Jika gagal (misal format manual DD/MM/YYYY yang kadang error di native Date tergantung env)
  // Bersihkan karakter pemisah ke satu jenis (/)
  const cleaned = dateStr.replace(/[-. ]/g, "/");
  const parts = cleaned.split("/");
  
  if (parts.length === 3) {
    let [p1, p2, p3] = parts;
    
    // Kasus YYYY/MM/DD
    if (p1.length === 4) {
      return `${p3.padStart(2, '0')}/${p2.padStart(2, '0')}/${p1}`;
    }
    
    // Kasus DD/MM/YYYY
    return `${p1.padStart(2, '0')}/${p2.padStart(2, '0')}/${p3}`;
  }

  return dateStr;
}
