import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return dateStr;
  const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  let day, month, year;
  if (parts[0].length === 4) { [year, month, day] = parts; } 
  else { [day, month, year] = parts; }
  const monthName = months[parseInt(month) - 1] || month;
  return `${day.padStart(2, '0')} ${monthName} ${year}`;
};

export const generateSKL = (data: any) => {
  const set = data.pengaturan;
  const paperFormat = set?.paper_size === "f4" ? [210, 330] : "a4";
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: paperFormat,
  });

  const lulus = data.status_lulus ? "LULUS" : "TIDAK LULUS";
  
  const kepsek = set?.nama_kepsek || "Nama Kepala Sekolah";
  const nip = set?.nip_kepsek || "NIP. -";
  const pangkat = set?.pangkat || "-";
  const nomorSurat = set?.nomor_surat || "000/xxx/2026";
  const tglSurat = set?.tgl_surat || "Juni 2026";
  const tahunAjaran = set?.tahun_ajaran || "2025/2026";

  const imgKop = new Image();
  const imgTtd = new Image();
  const imgCap = new Image();

  imgKop.src = '/kop.png'; 
  imgTtd.src = `/tte/signature.png?t=${Date.now()}`;
  imgCap.src = `/tte/stamp.png?t=${Date.now()}`;

  // Fungsi pembantu agar gambar dimuat dulu baru cetak PDF
  const loadImage = (img: HTMLImageElement) => {
    return new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  // Kita pakai Async/Await supaya lebih rapi daripada callback bertingkat
  Promise.all([loadImage(imgKop), loadImage(imgTtd), loadImage(imgCap)]).then(() => {
    // Helper untuk mengganti placeholder
    const replacePlaceholders = (text: string) => {
      if (!text) return "";
      return text
        .replace(/{tahun_ajaran}/g, tahunAjaran)
        .replace(/{{nama}}/g, data.nama.toUpperCase())
        .replace(/{{nisn}}/g, data.nisn)
        .replace(/{{nis}}/g, data.nis)
        .replace(/{{tempat_lahir}}/g, data.tempat_lahir)
        .replace(/{{tgl_lahir}}/g, formatDateIndo(data.tgl_lahir))
        .replace(/{{rata_rata_nilai}}/g, data.rata_rata_nilai || "-")
        .replace(/{{status_lulus}}/g, lulus);
    };

    // 1. KOP SURAT
    doc.addImage(imgKop, 'PNG', set?.kop_x || 10, set?.kop_y || 10, set?.kop_width || 190, set?.kop_height || 40); 

    // 2. JUDUL SURAT
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SURAT KETERANGAN LULUS", 105, 60, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor : ${nomorSurat}`, 105, 67, { align: "center" });
    doc.line(65, 69, 145, 69);

    // 3. DATA KEPALA SEKOLAH
    doc.text(replacePlaceholders(set?.text_pembuka || "Yang bertanda tangan dibawah ini :"), 20, 80);
    autoTable(doc, {
      startY: 83,
      margin: { left: 25 },
      body: [
        ["Nama", `: ${kepsek.toUpperCase()}`],
        ["NIP", `: ${nip}`],
        ["Pangkat/Gol", `: ${pangkat}`],
        ["Jabatan", `: Kepala SMA Negeri 1 Margaasih`],
      ],
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 35 } },
    });

    // 4. DATA SISWA
    const middleY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(replacePlaceholders(set?.text_menerangkan || "Dengan ini menerangkan bahwa :"), 20, middleY);
    autoTable(doc, {
      startY: middleY + 3,
      margin: { left: 25 },
      body: [
        ["Nama", `: ${data.nama.toUpperCase()}`],
        ["Tempat, Tanggal Lahir", `: ${data.tempat_lahir}, ${formatDateIndo(data.tgl_lahir)}`],
        ["Nama Ayah", `: ${data.nama_ayah}`],
        ["NIS", `: ${data.nis}`],
        ["NISN", `: ${data.nisn}`],
        ["Rata-rata Nilai", `: ${data.rata_rata_nilai || "-"}`],
      ],
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 45 } },
    });

    // 5. STATUS KELULUSAN
    const statementY = (doc as any).lastAutoTable.finalY + 15;
    const textKeputusan = replacePlaceholders(set?.text_keputusan || "Berdasarkan hasil evaluasi pembelajaran Tahun Pelajaran {tahun_ajaran}, siswa tersebut di atas telah dinyatakan :");
    doc.text(textKeputusan, 20, statementY, { maxWidth: 170 });

    const boxY = statementY + 10;
    doc.setLineWidth(0.5);
    doc.rect(75, boxY, 60, 15); 
    doc.setFont("helvetica", "bold").setFontSize(16);
    doc.text(`${lulus}`, 105, boxY + 10, { align: "center" });

    doc.setFont("helvetica", "normal").setFontSize(11);
    doc.text(replacePlaceholders(set?.text_penutup || "Demikian Surat Keterangan Lulus ini dibuat agar dapat digunakan keperluan lain sesuai kebutuhan."), 20, boxY + 25);

    // 6. TANDA TANGAN & CAP
    const ttdAreaY = boxY + 45;
    doc.text(`${tglSurat}`, 130, ttdAreaY);
    doc.text(`Kepala SMA Negeri 1 Margaasih,`, 130, ttdAreaY + 7);

    // Debugging: Cek status tte di console
    console.log("Status TTE di PDF:", set?.show_tte);

    // Tambahkan TTD & Cap (Hanya jika diaktifkan di setting dan gambar ada)
    if (set?.show_tte === true) {
      // Cek apakah gambar berhasil dimuat (width > 0)
      if (imgTtd.complete && imgTtd.naturalWidth > 0) {
        doc.addImage(imgTtd, 'PNG', set.sig_x || 135, set.sig_y || (ttdAreaY + 10), set.sig_width || 40, set.sig_height || 20);
      }
      if (imgCap.complete && imgCap.naturalWidth > 0) {
        doc.addImage(imgCap, 'PNG', set.stamp_x || 120, set.stamp_y || (ttdAreaY + 8), set.stamp_width || 30, set.stamp_height || 30);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${kepsek.toUpperCase()}`, 130, ttdAreaY + 40);
    doc.line(130, ttdAreaY + 41, 185, ttdAreaY + 41);
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${nip}`, 130, ttdAreaY + 46);

    // Selesai!
    doc.save(`SKL_${data.nisn}_${data.nama.split(' ')[0]}.pdf`);
  });
};