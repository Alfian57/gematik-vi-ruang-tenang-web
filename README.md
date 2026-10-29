# Ruang Tenang Web

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Serwist-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://serwist.pages.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

Portal web frontend untuk platform kesehatan mental **Ruang Tenang**. Dibangun menggunakan **Next.js 15 App Router**, **TypeScript**, dan **Tailwind CSS v4**, aplikasi ini melayani antarmuka terintegrasi bagi tiga pemangku kepentingan: **Member (Pengguna Umum/Mahasiswa)**, **Admin & Moderator**, serta **Mitra Organisasi (B2B)**.

---

## Daftar Isi

- [Konteks Ekosistem](#konteks-ekosistem)
- [Fitur Berdasarkan Peran Pengguna](#fitur-berdasarkan-peran-pengguna)
- [Prasyarat Sistem](#prasyarat-sistem)
- [Mulai Cepat (Quick Start)](#mulai-cepat-quick-start)
  - [Langkah Instalasi](#langkah-instalasi)
  - [Panduan Login Akun Demo](#panduan-login-akun-demo)
- [Daftar Perintah (Scripts)](#daftar-perintah-scripts)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Direktori Proyek](#struktur-direktori-proyek)
- [Fitur PWA & Offline Support](#fitur-pwa--offline-support)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Docker & Deployment](#docker--deployment)
- [Keamanan & Kontribusi](#keamanan--kontribusi)

---

## Konteks Ekosistem

Web ini beroperasi berdampingan dengan proyek-proyek Ruang Tenang lainnya:
1. **Backend API (`ruang-tenang-api`)**: Sumber data utama, penyedia endpoint otentikasi JWT, validasi bisnis, dan integrasi pihak ketiga. Web mengirim request ke `http://localhost:8080/api/v1` (atau URL server publik).
2. **Aplikasi Mobile (`ruang-tenang-mobile`)**: Aplikasi Flutter yang secara khusus hanya melayani peran *Member*. Seluruh fitur manajemen tingkat lanjut (*Admin/Moderator*) dan portal korporat (*Mitra*) ditangani secara eksklusif oleh web ini.

---

## Fitur Berdasarkan Peran Pengguna

### 1. Portal Member (Mahasiswa & Pengguna Umum)
- **Self-Care Harian**: Mood tracker dengan visualisasi kalender & analitik emosi, serta jurnal harian (dengan opsi publik/privat).
- **AI Mental Companion**: Konseling interaktif via chat AI dengan pemahaman riwayat konteks mood & jurnal.
- **Komunitas & Konten**: Membaca artikel kesehatan mental, membagikan kisah perjuangan (*stories*), dan forum diskusi terkelola.
- **Relaksasi & Audio**: Pemutar musik relaksasi instrumental dengan dukungan background audio dan playlist personal.
- **Gamifikasi & Perjalanan**: Peta perjalanan kesehatan mental (*journey map*), perolehan lencana (*badges*), quest harian berhadiah EXP, dan leaderboard.
- **Toko & Billing**: Pembelian koin dan paket langganan premium melalui integrasi modal Duitku Pop.

### 2. Portal Admin & Moderator
- **Manajemen Pengguna**: Pemantauan akun terdaftar, status keanggotaan, dan aktivasi.
- **Moderasi Komunitas**: Tinjauan laporan postingan forum, kurasi kisah pengguna, sensor konten sensitif, dan pengaturan kata kunci krisis (*crisis triggers*).
- **Kurasi Konten**: Publikasi artikel edukatif, manajemen katalog musik dan lisensi lagu.
- **Broadcast & Notifikasi**: Pengiriman siaran pengumuman penting via Web Push Notifications.

### 3. Portal Mitra Organisasi (B2B)
- **Manajemen Seat Organisasi**: Alokasi dan manajemen lisensi akses anggota organisasi/kampus.
- **Laporan & Insight Agregat**: Statistik tren kesehatan mental secara anonim untuk menjaga privasi karyawan/mahasiswa.
- **Pengaturan SSO & Invoice**: Konfigurasi Single Sign-On dan pelacakan tagihan B2B.

---

## Prasyarat Sistem

- **Node.js**: Versi 22.x direkomendasikan (minimal v20.x ke atas)
- **Package Manager**: npm (bawaan Node.js)
- **Backend API**: Layanan [ruang-tenang-api](file:///home/alfiang/Projects/ruang-tenang/ruang-tenang-api) aktif dan dapat diakses (default `http://localhost:8080`)

---

## Mulai Cepat (Quick Start)

### Langkah Instalasi

1. **Instal Dependencies:**
   ```bash
   npm ci
   ```

2. **Setup Konfigurasi Environment:**
   ```bash
   cp .env.example .env.local
   ```
   *Secara default `.env.local` akan mengarah ke endpoint API lokal `http://localhost:8080/api/v1`.*

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

Buka **`http://localhost:3000`** di browser Anda. Development server menggunakan Turbopack untuk kompilasi yang cepat.

### Panduan Login Akun Demo

Jika backend telah menjalankan `make seed`, Anda dapat menguji seluruh tampilan peran menggunakan kredensial demo berikut:

| Peran (Role) | Email | Password | Rute Halaman |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `password` | `/dashboard/admin` |
| **Mitra (B2B)** | `mitra@gmail.com` | `password` | `/dashboard/mitra` |
| **Member Premium** | `gading@gmail.com` | `password` | `/dashboard` |
| **Member Freemium** | `andhika@gmail.com` | `password` | `/dashboard` |

---

## Daftar Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server development Next.js dengan compiler Turbopack |
| `npm run build` | Melakukan kompilasi aset untuk deployment produksi |
| `npm run start` | Menjalankan build produksi secara lokal |
| `npm run lint` | Menjalankan audit kode dengan ESLint |
| `npm run typecheck` | Menjalankan pengecekan tipe statis TypeScript tanpa membuat output (`--noEmit`) |
| `npm run format` | Memformat kode secara otomatis dengan Prettier |
| `npm run format:check` | Memeriksa apakah formatting kode sudah rapi sesuai standar |
| `npm run test:smoke` | Menjalankan skrip audit smoke statis pada route dan invariant kritis |
| `npm run verify` | Menjalankan suite verifikasi penuh: `lint` + `typecheck` + `test:smoke` + `build` |

> [!TIP]
> Selalu jalankan `npm run verify` sebelum melakukan push atau membuat Pull Request untuk memastikan build lolos pemeriksaan CI.

---

## Konfigurasi Environment

Konfigurasi disimpan di file `.env.local` (tidak di-commit ke Git). Nilai default diambil dari `.env.example`.

| Variabel | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | URL absolut endpoint API backend (termasuk suffix `/api/v1`) | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_APP_TIMEZONE` | Zona waktu tampilan format tanggal & jam | `Asia/Jakarta` |
| `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` | Daftar hostname gambar eksternal yang diizinkan (dipisah koma) | `ruang-tenang.site,localhost,127.0.0.1` |
| `NEXT_PUBLIC_DUITKU_ENV` | Lingkungan payment gateway Duitku Pop | `sandbox` atau `production` |

> [!WARNING]
> Jangan pernah memasukkan secret backend, private key database, atau token server ke variabel dengan awalan `NEXT_PUBLIC_*` karena akan terbaca oleh browser klien.

---

## Struktur Direktori Proyek

```text
ruang-tenang-web/
├── app/                  # Next.js App Router (Layouts, Pages, Server Components)
│   ├── (landing)/        # Halaman publik (Beranda, Informasi, Landing Page)
│   ├── (auth)/           # Alur autentikasi (Login, Register WhatsApp, OTP, Reset)
│   └── dashboard/        # Area terproteksi:
│       ├── member/       # Fitur konseling, self-care, musik, jurnal, gamifikasi
│       ├── admin/        # Panel kontrol admin, moderasi, billing, broadcast
│       └── mitra/        # Portal organisasi korporat & B2B
├── components/           # Komponen UI reusable, modal dialog, layout shell, music player
├── config/               # Schema validasi environment Zod (`env.ts`)
├── hooks/                # Custom React hooks (view-model, audio control, responsive UI)
├── lib/
│   ├── offline/          # Logika IndexedDB & outbox antrean mutation saat offline
│   └── payment/          # Script loader & callback wrapper Duitku Pop
├── services/             # Layer komunikasi HTTP (`services/http/client.ts` & per-domain API)
├── store/                # Global state management menggunakan Zustand
├── types/                # Kontrak tipe TypeScript lintas modul dan response API
├── utils/                # Sanitizer DOMPurify, date formatter, helper classname
└── scripts/              # Skrip otomasi smoke test (`audit-smoke.mjs`)
```

---

## Fitur PWA & Offline Support

Web ini dilengkapi dengan modul **Progressive Web App (PWA)** berbasis Serwist:
- **Installable**: Dapat di-install layaknya aplikasi native pada desktop (Chrome/Edge) maupun mobile (PWA Android & iOS).
- **Asset Caching**: Service worker secara cerdas menyimpan cache font, icon, dan shell UI agar halaman terbuka instan saat koneksi lambat.
- **Offline Mutation Queue**: Fitur dasar seperti penulisan draft jurnal didukung antrean outbox lokal via IndexedDB yang otomatis disinkronkan kembali saat koneksi pulih.
  *(Catatan: Transaksi billing, chat konseling AI real-time, dan panel admin wajib menggunakan koneksi online).*

---

## Troubleshooting & FAQ

### 1. Muncul `Network Error` atau request API gagal (CORS)
- Pastikan backend `ruang-tenang-api` sudah berjalan di port yang benar (misal `http://localhost:8080`).
- Periksa file `.env.local` pada frontend: pastikan `NEXT_PUBLIC_API_BASE_URL` mengarah ke URL API yang aktif.
- Periksa konfigurasi `CORS_ALLOWED_ORIGINS` di file `.env` milik backend API: pastikan menyertakan origin `http://localhost:3000`.

### 2. Error pada Turbopack saat `npm run dev`
Jika terjadi kendala cache Turbopack, jalankan dev server tanpa cache dengan menghapus direktori `.next`:
```bash
rm -rf .next
npm run dev
```

### 3. Masalah Tampilan atau Hydration Warning
Pastikan ekstensi browser yang menyuntikkan script DOM pihak ketiga (seperti translation tool atau password manager agresif) dinonaktifkan saat pengujian.

---

## Docker & Deployment

- **Containerization**: Tersedia `Dockerfile` multi-stage berbasis Node.js 22 alpine dengan fitur Next.js *standalone output* untuk efisiensi ukuran container dan konsumsi memori.
- **Runtime Environment Injection**: Skrip `entrypoint.sh` memungkinkan injeksi nilai `NEXT_PUBLIC_API_BASE_URL` saat container di-boot di environment staging/production.
- **CI/CD Pipeline**: Alur kerja GitHub Actions `.github/workflows/build-and-deploy.yml` secara otomatis memvalidasi `npm run verify`, membangun image, mempublikasikannya ke GHCR (GitHub Container Registry), dan melakukan deployment ke VPS server.

---

## Keamanan & Kontribusi

- Simpan seluruh kredensial pengujian di file lokal dan jangan pernah meng-commit file `.env.local`.
- Sebelum mengajukan perubahan fitur, selalu pastikan seluruh checklist `npm run verify` berstatus hijau.
- Pedoman kerja kolaborasi AI Agent selengkapnya dapat dipelajari di `AGENTS.md` dan dokumentasi teknis mendalam di folder `context/`.
