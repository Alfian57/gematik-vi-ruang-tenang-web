# Panduan Deployment Next.js (`ruang-tenang-web`) ke cPanel Shared Hosting

Dokumen ini berisi panduan teknis langkah demi langkah untuk melakukan deployment aplikasi frontend **ruang-tenang-web** (Next.js 15 Standalone Mode + Serwist PWA) ke shared hosting cPanel menggunakan fitur **Setup Node.js App (Phusion Passenger)** dan **cPanel Terminal (SSH)**.

> [!IMPORTANT]
> Seluruh proses build dan pengemasan bundle dijalankan **secara lokal** menggunakan script `scripts/deploy_cpanel.sh`. Jangan pernah menjalankan `npm run build` atau `npm install` langsung di shared hosting cPanel untuk menghindari batasan RAM dan error *Out of Memory (OOM / Killed)*.

---

## 1. Prasyarat Lingkungan

### A. Lingkungan Lokal (Komputer Pengembang)
- **Node.js**: Versi LTS 20.x atau 22.x.
- **npm**: v10+ (dependensi terpasang via `npm ci`).
- **Tooling**: `bash`, `zip`, Git.

### B. Lingkungan Server (cPanel Shared Hosting)
- Fitur **Setup Node.js App** (CloudLinux NodeJS Selector / Phusion Passenger).
- Akses **Terminal cPanel** atau koneksi SSH.
- Akses **File Manager** cPanel.
- Domain publik terhubung: `ruang-tenang.my.id` (A Record mengarah ke IP server hosting dan SSL aktif).
- Backend API terhubung: `api.ruang-tenang.my.id` (sudah aktif dan siap melayani request).

---

## 2. Konfigurasi Environment Produksi (Lokal)

> [!CRITICAL]
> **Mengapa Konfigurasi Environment Harus Dilakukan Sebelum Build di Lokal?**
> Pada Next.js, semua variabel lingkungan yang diawali **`NEXT_PUBLIC_*`** di-inline (*baked in*) langsung ke dalam berkas JavaScript statis browser dan konfigurasi server standalone saat perintah `npm run build` dijalankan di komputer lokal.
> Jika Anda membangun bundle tanpa konfigurasi ini, aplikasi yang terpasang di cPanel akan memanggil `http://localhost:8080`, bukan domain API produksi Anda.

Pastikan berkas `.env.production` di root folder proyek lokal (`ruang-tenang-web/.env.production`) memuat konfigurasi berikut:

```env
# URL API Backend Produksi
NEXT_PUBLIC_API_BASE_URL=https://api.ruang-tenang.my.id/api/v1
NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta

# Domain Gambar yang Diizinkan (Next Image remotePatterns)
NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS=ruang-tenang.my.id,api.ruang-tenang.my.id

# Lingkungan Duitku Payment Gateway (sandbox / production)
NEXT_PUBLIC_DUITKU_ENV=sandbox

# Mode Node.js
NODE_ENV=production
```

> [!WARNING]
> **Prioritas `.env.local` Terhadap `.env.production`**
> Next.js secara default memprioritaskan `.env.local` di atas `.env.production`. Script otomatis `scripts/deploy_cpanel.sh` telah diprogram untuk memindahkan `.env.local` sementara saat proses build, lalu mengembalikannya secara aman setelah build selesai.

---

## 3. Proses Build & Perakitan Bundle di Lokal

Jalankan perintah build dari root direktori `ruang-tenang-web`:

```bash
make deploy-cpanel
# atau jalankan script langsung:
bash scripts/deploy_cpanel.sh
```

### Rangkaian Otomasi Script:
1. **Preflight Check**: Memvalidasi ketersediaan `node`, `npm`, `zip`, `node_modules`, dan berkas `.env.production`.
2. **Validasi Environment**: Menolak build jika `NEXT_PUBLIC_API_BASE_URL` masih mengarah ke `localhost` atau jika `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` tidak memuat host API.
3. **Pembangunan Standalone**: Menjalankan `npm run build` dengan isolasi environment produksi.
4. **Verifikasi Artefak**: Memeriksa berkas chunk JavaScript untuk memastikan host produksi benar-benar tertanam.
5. **Perakitan Bundle**:
   - Menyalin output `.next/standalone/`.
   - Menyalin seluruh folder `public/` (termasuk Service Worker `sw.js` dan aset gambar statis seperti `default-avatar.png`).
   - Menyalin berkas statis `.next/static/` ke `.next/static/` bundle (**krusial**, Next.js standalone tidak menyertakannya secara otomatis).
   - Menghapus berkas `.env*` lokal agar tidak menimpa environment server cPanel.
6. **Pembuatan Arsip Zip**: Menghasilkan berkas arsip `upload-web.zip` yang membungkus folder utama `ruang-tenang-web/`.

### Struktur Berkas di Dalam `upload-web.zip`:
```text
upload-web.zip
└── ruang-tenang-web/            <-- Application Root cPanel saat diekstrak
    ├── .next/
    │   ├── server/              <-- Server runtime standalone
    │   ├── static/              <-- Asset statis Next.js (CSS, JS chunks, media)
    │   ├── BUILD_ID
    │   └── ...manifest files
    ├── node_modules/            <-- Dependensi runtime terisolasi (~40-50MB)
    ├── public/                  <-- Asset publik (sw.js, icon, gambar statis)
    ├── package.json
    └── server.js                <-- Entrypoint HTTP server Next.js standalone
```

---

## 4. Konfigurasi Awal Node.js App di cPanel

*(Lakukan langkah ini satu kali pada setup pertama)*

1. Masuk ke **cPanel** -> Buka menu **Setup Node.js App**.
2. Klik tombol **Create Application**:
   - **Node.js Version**: Pilih versi LTS terbaru (misal `20.x` atau `22.x`).
   - **Application Mode**: `Production`.
   - **Application Root**: `ruang-tenang-web` (relatif terhadap direktori home user `~`).
   - **Application URL**: Pilih domain utama `ruang-tenang.my.id`.
   - **Application Startup File**: `server.js`.
3. Klik **Create** / **Save**.
4. Catat path aktivasi virtualenv yang ditampilkan di bagian atas halaman (misal: `source /home/username/nodevenv/ruang-tenang-web/20/bin/activate`).

---

## 5. Pengunggahan & Pemasangan ke Server

### A. Unggah Berkas Bundle
1. Buka **File Manager** cPanel atau gunakan cPanel UAPI / FTP.
2. Unggah file `upload-web.zip` ke direktori home (`/home/username/`).

### B. Ekstraksi & Konfigurasi Runtime via SSH Terminal
Buka **Terminal cPanel** (SSH) dan jalankan:

```bash
cd ~
# Ekstrak file zip (overwrite berkas lama)
unzip -o -q upload-web.zip -d ~

# Buat file .env runtime server bila belum ada
cat << 'EOF' > ~/ruang-tenang-web/.env
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
EOF

# Bersihkan cache gambar lama (mencegah cache 0-byte beracun)
rm -rf ~/ruang-tenang-web/.next/cache/images

# Restart aplikasi Node.js Passenger
touch ~/ruang-tenang-web/tmp/restart.txt

# Bersihkan file zip sementara untuk menghemat kuota hosting
rm -f ~/upload-web.zip
```

> [!TIP]
> **Mengapa Ekstraksi Menggunakan Terminal SSH Lebih Disarankan?**
> Ekstraksi arsip via File Manager cPanel terkadang gagal dengan pesan `checkdir error: cannot create ruang-tenang-web: Permission denied` jika folder target sudah ada dengan kepemilikan proses tertentu. Menggunakan perintah `unzip -o -q upload-web.zip -d ~` via SSH Terminal menjamin proses berjalan lancar dan menimpa berkas secara bersih.

---

## 6. Verifikasi Pasca Deployment

1. **Uji Halaman Utama**:
   ```bash
   curl -s -I https://ruang-tenang.my.id/
   ```
   *Respon harus `HTTP/2 200`.*
2. **Uji Aset Statis Next.js**:
   Buka browser -> Inspect Network (F12). Pastikan seluruh file di bawah `/_next/static/...` (`.css`, `.js`) berstatus **200 OK** dan bukan 404.
3. **Uji Gambar Statis Default Avatar**:
   ```bash
   curl -s -I https://ruang-tenang.my.id/images/default-avatar.png
   ```
   *Respon harus `HTTP/2 200` dengan ukuran valid.*
4. **Uji Optimasi Gambar Dinamis Backend**:
   Buka halaman `/stories` atau `/articles` dan pastikan cover serta thumbnail termuat tajam tanpa gambar rusak.
5. **Uji PWA Service Worker**:
   Pada browser, periksa tab **Application -> Service Workers**. Status `sw.js` harus *Activated and running*.

---

## 7. Panduan Penyelesaian Masalah (Troubleshooting)

### A. Gambar Dinamis (`next/image`) Menampilkan Kotak Kosong / Rusak (0 Bytes)
- **Penyebab**:
  Komponen frontend meneruskan path relatif backend (seperti `/uploads/images/cover.jpg`) langsung ke `<Image src="...">`. Pada mode standalone, Next.js image optimizer mencari path relatif di dalam folder lokal `public/` web bundle. Karena file tersebut berada di server API Golang, pencarian gagal dan optimizer mengembalikan respon kosong **0 bytes** dengan status 200.
- **Solusi**:
  1. Selalu bungkus path relatif gambar backend dengan helper `getUploadUrl()` dari `@/services/http/upload-url`. Helper ini mengubah path menjadi URL absolut (`https://api.ruang-tenang.my.id/uploads/...`).
  2. Next.js mengenali URL absolut sebagai gambar remote dan mengunduhnya melalui HTTP proxy internal menggunakan pola yang terdaftar di `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS`.

### B. Gambar Tetap Rusak Meski Path Sudah Benar (*Poisoned Image Cache*)
- **Penyebab**:
  Jika gambar pernah diminta saat backend sedang offline atau file belum siap, Next.js image optimizer menyimpan hasil gagal (0-byte) ke dalam folder `.next/cache/images/` dengan header `x-nextjs-cache: HIT` selama 31 hari (`minimumCacheTTL`).
- **Solusi**:
  Jalankan pembersihan cache di terminal SSH server:
  ```bash
  rm -rf ~/ruang-tenang-web/.next/cache/images
  touch ~/ruang-tenang-web/tmp/restart.txt
  ```

### C. Aset `/_next/static/...` Mengembalikan 404 Not Found
- **Penyebab**:
  Folder `.next/static/` tidak disalin ke bundle. Mode standalone Next.js sengaja tidak menyalin folder statis secara otomatis.
- **Solusi**:
  Gunakan script `bash scripts/deploy_cpanel.sh` (atau `make deploy-cpanel`) yang sudah otomatis menyalin `.next/static/` ke dalam bundle `upload-web.zip`.

### D. Request API di Browser Mengarah ke `localhost:8080`
- **Penyebab**:
  Nilai `NEXT_PUBLIC_API_BASE_URL` saat build di komputer lokal masih bernilai dev/localhost, atau tertimpa oleh file `.env.local`.
- **Solusi**:
  Pastikan `.env.production` berisi `https://api.ruang-tenang.my.id/api/v1`, lalu jalankan ulang `make deploy-cpanel`. Script deployment otomatis memvalidasi chunk JS dan menggagalkan proses build jika `localhost` terdeteksi.

### E. Error 503 Service Unavailable / Passenger Crash
- **Penyebab**:
  Konfigurasi startup file salah atau terdapat syntax error pada runtime Node.js.
- **Pemeriksaan**:
  Periksa berkas log error server di `~/ruang-tenang-web/stderr.log`.
- **Solusi**:
  1. Pastikan **Application Startup File** di cPanel diset tepat ke `server.js`.
  2. Pastikan file `.env` di server memiliki izin baca.
  3. **Jangan pernah** menjalankan `npm install` di cPanel terminal.
