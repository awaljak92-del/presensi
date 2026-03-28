// Konfigurasi Utama
const SPREADSHEET_ID = '1BpiBKfjTsHYu8684qXgmiJGoVZS4t4uQAzrObTqqr0k';
const MAX_RADIUS = 30; // dalam meter
const FOLDER_ID = '1Pi1y-k6TxgsKxX7y57JVBBKsVNKoqw1c';

// Daftar Lokasi yang Diizinkan
const LOKASI_KANTOR = [
  { nama: "Kantor Narindo", lat: -2.6921418574096725, lng: 111.6369972832742 },
  { nama: "Kantor Branch Telkomsel", lat: -2.708127883344518, lng: 111.64897759908632 }
];

// Handle CORS preflight requests dari React
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk mencari Nama berdasarkan ID dari sheet DATA_USER
function getNamaUser(idUser) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('DATA_USER');
    if (!sheet) return null;
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === idUser.toString()) {
        return data[i][1];
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Menghitung jarak menggunakan Haversine Formula
function hitungJarakM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fungsi untuk mencari jarak terdekat dari beberapa titik lokasi
function cekJarakTerdekat(latUser, lngUser) {
  let jarakTerdekat = Infinity;
  for (let i = 0; i < LOKASI_KANTOR.length; i++) {
    let jarak = hitungJarakM(LOKASI_KANTOR[i].lat, LOKASI_KANTOR[i].lng, latUser, lngUser);
    if (jarak < jarakTerdekat) {
      jarakTerdekat = jarak;
    }
  }
  return jarakTerdekat;
}

// Menerima request POST dari React App
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ==========================================
    // 1. HANDLE LOGIN ACTION
    // ==========================================
    if (data.action === 'login') {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('DATA_USER');
      if (!sheet) throw new Error("Sheet DATA_USER tidak ditemukan!");
      
      const users = sheet.getDataRange().getValues();
      // Asumsi: Kolom A = ID, Kolom B = Nama, Kolom C = Password
      for (let i = 1; i < users.length; i++) {
        if (users[i][0].toString() === data.id.toString()) {
          // Jika ada kolom password (kolom ke-3 / index 2)
          const passwordDiSheet = users[i][2] ? users[i][2].toString() : '123456'; // Default 123456 jika kosong
          
          if (passwordDiSheet === data.password.toString()) {
            return ContentService.createTextOutput(JSON.stringify({
              success: true,
              message: "Login berhasil",
              user: {
                id: users[i][0].toString(),
                nama: users[i][1].toString()
              }
            })).setMimeType(ContentService.MimeType.JSON);
          } else {
            return ContentService.createTextOutput(JSON.stringify({
              success: false,
              message: "Password salah!"
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "ID Karyawan tidak ditemukan!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 2. HANDLE CHECK-IN ACTION (DEFAULT)
    // ==========================================
    const jarak = cekJarakTerdekat(data.lat, data.lng);
    
    // Validasi Lokasi (HANYA UNTUK STATUS HADIR)
    if (data.status === 'Hadir' && jarak > MAX_RADIUS) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        message: "GAGAL: Lokasi Anda di luar jangkauan untuk presensi Hadir. Anda berjarak " + Math.round(jarak) + " meter dari titik lokasi terdekat."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Cari nama user
    let namaUser = getNamaUser(data.id);
    if (!namaUser) namaUser = "User " + data.id;

    // PROSES UPLOAD FOTO KE GOOGLE DRIVE
    let imageFormula = "";
    let imageUrl = "";
    if (data.foto && data.foto.includes("base64,")) {
      const base64Data = data.foto.split(',')[1];
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), MimeType.JPEG, namaUser + "_" + data.status + ".jpg");
      
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // Agar bisa dilihat di React
      const fileId = file.getId();
      
      imageUrl = `https://drive.google.com/uc?id=${fileId}`;
      imageFormula = `=IMAGE("${imageUrl}")`;
    }

    // Siapkan Data ke Spreadsheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('DATA_ABSEN');
    if (!sheet) throw new Error("Sheet DATA_ABSEN tidak ditemukan!");

    const now = new Date();
    const waktu = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    const jam = Utilities.formatDate(now, "Asia/Jakarta", "HH:mm:ss");

    // Simpan ke sheet. Tambahkan imageUrl di kolom ke-10 agar mudah dibaca oleh doGet
    sheet.appendRow([
      waktu,
      data.id,
      namaUser,
      data.status,
      jam,
      data.keterangan || "-",
      data.lat || "-",
      data.lng || "-",
      imageFormula,
      imageUrl
    ]);

    let pesanSukses = "BERHASIL: Data presensi (" + data.status + ") telah tersimpan!";
    if (data.status === 'Hadir') {
      pesanSukses += " Jarak Anda valid: " + Math.round(jarak) + " meter.";
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: pesanSukses 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      message: "Error sistem: " + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Mengirim data riwayat ke React App
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('DATA_ABSEN');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = data.slice(1);
    const result = rows.map(row => {
      return {
        timestamp: row[0], // Waktu
        id: row[1], // ID User
        nama: row[2], // Nama
        status: row[3], // Hadir/Sakit/Izin/Libur
        jam: row[4], // Jam
        keterangan: row[5], // Keterangan
        location: row[6] + ", " + row[7], // Lat, Lng
        imageUrl: row[9] || "" // URL Gambar mentah di kolom 10
      };
    });
    
    // Return latest first
    result.reverse();
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================================
// FUNGSI BARU: PENGECEKAN ALPHA OTOMATIS OLEH SISTEM
// ==========================================================
function cekAlphaOtomatis() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetUser = ss.getSheetByName('DATA_USER');
  const sheetAbsen = ss.getSheetByName('DATA_ABSEN');

  const dataUser = sheetUser.getDataRange().getValues();
  const dataAbsen = sheetAbsen.getDataRange().getValues();

  const now = new Date();
  const hariIni = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy");
  
  // 1. Kumpulkan semua ID yang sudah absen hari ini
  let idSudahAbsen = [];
  for (let i = 1; i < dataAbsen.length; i++) {
    const waktuAbsen = dataAbsen[i][0].toString(); 
    const idAbsen = dataAbsen[i][1].toString();
    
    if (waktuAbsen.includes(hariIni)) {
      idSudahAbsen.push(idAbsen);
    }
  }

  // 2. Cek setiap user di DATA_USER. Kalau tidak ada di daftar absen hari ini, catat Alpha.
  for (let i = 1; i < dataUser.length; i++) {
    const idUser = dataUser[i][0].toString();
    const namaUser = dataUser[i][1].toString();

    if (idUser !== "" && !idSudahAbsen.includes(idUser)) {
      const waktuAlpha = hariIni + " 23:59:00";
      sheetAbsen.appendRow([
        waktuAlpha, 
        idUser, 
        namaUser, 
        "Alpha", 
        "23:59:00", 
        "Tidak melakukan presensi (Sistem Otomatis)", 
        "-", 
        "-", 
        "-",
        ""
      ]);
    }
  }
}
