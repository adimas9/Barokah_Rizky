# Barokah Rizky - Aplikasi Penjualan Kayu

Aplikasi penjualan kayu batangan dengan input pelanggan dan perhitungan otomatis.

## 🚀 Cara Menjalankan

1. Buka terminal di folder ini.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
4. Buka browser di alamat yang muncul (biasanya `http://localhost:5173`).

## 📁 Konfigurasi Data

File konfigurasi data ada di folder `src/data/`:

### 1. `src/data/volumeTable.json`
**PENTING: Di sini tempat data "Isi" kayu disimpan.**
Format file ini adalah JSON. Anda (Owner) perlu mengisinya dengan tabel data asli.

Contoh struktur:
```json
{
  "jati": [
    {
      "length": 200, 
      "diameters": {
        "13": 10,  // Diameter 13 cm -> Isi 10
        "19": 14   // Diameter 19 cm -> Isi 14
      }
    }
  ]
}
```

### 2. `src/data/constants.js`
Berisi definisi Jenis Kayu, Range Diameter, dan User.

## 📱 Fitur (Modul Customer)
1. **Login**: Username default `customer` (tanpa password).
2. **Input Kayu**: 
   - Masukkan Jenis, Panjang, Diameter.
   - Sistem hitung "Kelas" dan "Isi" otomatis.
3. **Penotalan**: 
   - Input harga per m³ manual.
   - Hitungan otomatis.
