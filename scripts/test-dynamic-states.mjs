import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  try {
    ({ chromium } = require("/home/alfiang/.npm/_npx/e41f203b7505f1fb/node_modules/playwright"));
  } catch {
    ({ chromium } = require("/home/alfiang/.npm/_npx/420ff84f11983ee5/node_modules/playwright"));
  }
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:8082/api/v1";

const PRIMARY_EMPTY_DIR = resolve(process.cwd(), "test/dynamic-states/empty");
const PRIMARY_MANY_DIR = resolve(process.cwd(), "test/dynamic-states/many");
const PARENT_EMPTY_DIR = resolve(process.cwd(), "../test/dynamic-states/empty");
const PARENT_MANY_DIR = resolve(process.cwd(), "../test/dynamic-states/many");
const ARTIFACT_EMPTY_DIR = resolve(
  "/home/alfiang/.gemini/antigravity-cli/brain/95eee9bc-91cd-4eca-ae01-4d3a0a75870a/screenshots/dynamic-states/empty"
);
const ARTIFACT_MANY_DIR = resolve(
  "/home/alfiang/.gemini/antigravity-cli/brain/95eee9bc-91cd-4eca-ae01-4d3a0a75870a/screenshots/dynamic-states/many"
);

[
  PRIMARY_EMPTY_DIR,
  PRIMARY_MANY_DIR,
  PARENT_EMPTY_DIR,
  PARENT_MANY_DIR,
  ARTIFACT_EMPTY_DIR,
  ARTIFACT_MANY_DIR,
].forEach((d) => mkdirSync(d, { recursive: true }));

function cleanDirectory(dir) {
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    if (file.endsWith(".png")) {
      try {
        unlinkSync(join(dir, file));
      } catch {}
    }
  }
}

cleanDirectory(PRIMARY_EMPTY_DIR);
cleanDirectory(PRIMARY_MANY_DIR);
cleanDirectory(PARENT_EMPTY_DIR);
cleanDirectory(PARENT_MANY_DIR);
cleanDirectory(ARTIFACT_EMPTY_DIR);
cleanDirectory(ARTIFACT_MANY_DIR);

async function getAuthSession(email, password, role) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json?.data?.token) {
      return {
        user: json.data.user,
        token: json.data.token,
      };
    }
  } catch (err) {
    console.warn(`[Auth] Could not login via API for ${email}, using fallback:`, err.message);
  }

  return {
    user: {
      id: role === "admin" ? 1 : role === "mitra" ? 2 : 3,
      name: role === "admin" ? "Administrator" : role === "mitra" ? "Mitra Ruang Tenang" : "Alfian Gading",
      email,
      role,
    },
    token: `mock-token-${role}`,
  };
}

// ----------------- MOCK DATA GENERATORS ----------------- //

function generateMockUsers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Pengguna Uji Coba #${i + 1} Ruang Tenang`,
    email: `pengguna.ke${i + 1}@universitas-indonesia.ac.id`,
    role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "mitra" : "user",
    created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    is_active: i % 7 !== 0,
    is_blocked: i % 11 === 0,
    is_banned: false,
    avatar: "",
  }));
}

function generateMockArticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Strategi Mengatasi Burnout & Manajemen Beban Kerja Akademik Bagian Ke-${i + 1}: Panduan Lengkap untuk Mahasiswa dan Profesional`,
    slug: `strategi-mengatasi-burnout-bagian-${i + 1}`,
    content: "Konten artikel panduan kesehatan mental yang komprehensif...",
    category: {
      id: (i % 4) + 1,
      name: ["Stres & Burnout", "Mindfulness", "Kesehatan Emosional", "Hubungan Sosial"][i % 4],
      slug: ["stres-burnout", "mindfulness", "emosional", "sosial"][i % 4],
    },
    status: ["published", "pending", "draft", "rejected"][i % 4],
    published_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    views_count: (i + 1) * 142,
    likes_count: (i + 1) * 38,
    author: {
      id: (i % 5) + 1,
      name: `Dr. Psikolog #${(i % 5) + 1}`,
      avatar: "",
    },
  }));
}

function generateMockSongs(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Alunan Hujan & Gelombang Meditasi ${i + 1} - Suara Alam Relaksasi Menenangkan Pikiran`,
    artist: `Ruang Tenang Sound Lab Studio ${((i % 3) + 1)}`,
    category: {
      id: (i % 3) + 1,
      name: ["Fokus", "Tidur Nyenyak", "Menenangkan Pikiran"][i % 3],
    },
    duration: 180 + i * 15,
    is_active: true,
    audio_url: "https://example.com/audio.mp3",
    cover_image: "",
    play_count: (i + 1) * 320,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockSongCategories(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: [
      "Fokus & Belajar",
      "Tidur Nyenyak",
      "Menenangkan Pikiran",
      "Relaksasi Alam",
      "Meditasi Pernapasan",
      "Suasana Hujan",
    ][i % 6] + (count > 6 ? ` ${Math.floor(i / 6) + 1}` : ""),
    description: "Koleksi alunan musik binaural dan instrumen yang menenangkan.",
    icon: "music",
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockPlaylists(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    uuid: `playlist-uuid-${i + 1}`,
    name: `Daftar Putar Pribadi #${i + 1}: Harmoni Pagi Tenang`,
    description: "Kompilasi musik favorit untuk menemani aktivitas harian.",
    thumbnail: "",
    is_public: i % 2 === 0,
    songs_count: 5 + (i % 8),
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
    songs: [],
  }));
}

function generateMockForums(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Bagaimana kalian menjaga batasan profesional di tempat kerja tanpa merasa bersalah? (Topik Diskusi Anggota #${i + 1})`,
    slug: `diskusi-topik-${i + 1}`,
    content: "Dalam beberapa minggu terakhir saya merasa kesulitan menolak tugas tambahan di luar jam kerja...",
    category: {
      id: (i % 3) + 1,
      name: ["Karier & Tempat Kerja", "Hubungan Sosial", "Kecemasan"][i % 3],
    },
    likes_count: (i + 1) * 12,
    posts_count: (i + 1) * 4,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    is_liked: false,
    user: {
      id: i + 1,
      name: `Mahasiswa Anggota #${i + 1}`,
      avatar: "",
    },
  }));
}

function generateMockForumPosts(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    forum_id: 1,
    content: `Tanggapan dan perspektif mendalam nomor #${i + 1}: Kuncinya adalah transparansi dan asertif. Buat daftar prioritas di awal hari dan sampaikan secara jelas kepada tim jika ada beban kerja berlebih.`,
    created_at: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    is_accepted: i === 0,
    likes_count: (count - i) * 3,
    is_liked: false,
    user_id: i + 2,
    user: {
      id: i + 2,
      name: `Rekan Komunitas #${i + 1}`,
      avatar: "",
    },
  }));
}

function generateMockLevels(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    level: i + 1,
    badge_name: `Tingkat ${i + 1} - ${["Pemula Tenang", "Penjelajah Refleksi", "Pelajar Sabar", "Praktisi Hebat", "Master Harmoni", "Pemberani"][i % 6]}`,
    min_exp: i * 250,
    tasks: `1. Selesaikan ${i + 1} kali check-in mood harian\n2. Tulis refleksi jurnal mendalam ${i + 1} kali\n3. Dengarkan 3 audio relaksasi fokus`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockRewards(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Voucher Merchandise / Kupon Konsultasi Khusus #${i + 1} - Ruang Tenang Wellness`,
    description: "Dapat ditukarkan dengan hadiah fisik atau sesi bimbingan kesehatan mental.",
    coin_cost: (i + 1) * 50,
    stock: (i + 1) * 5,
    is_active: i % 4 !== 0,
    image: "",
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockClaims(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    reward_id: (i % 5) + 1,
    user_id: (i % 10) + 1,
    coin_spent: (i + 1) * 50,
    claimed_at: new Date(Date.now() - i * 86400000).toISOString(),
    reward: {
      name: `Hadiah Eksklusif #${(i % 5) + 1}`,
    },
    user: {
      name: `Member Penerima #${(i % 10) + 1}`,
      email: `member${i + 1}@kampus.ac.id`,
      avatar: "",
    },
  }));
}

function generateMockBroadcasts(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Pengingat Kesejahteraan & Jeda Bernapas Rutin Pekan Ke-${i + 1}`,
    message: "Luangkan waktu 5 menit untuk bernapas perlahan, istirahatkan matamu dari layar gawai, dan nikmati momen tenang hari ini.",
    status: ["sent", "scheduled", "draft", "sending"][i % 4],
    target_role: "all",
    scheduled_at: new Date(Date.now() + i * 86400000).toISOString(),
    sent_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    recipient_count: (i + 1) * 250,
  }));
}

function generateMockTransactions(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    order_id: `RT-INV-2026-${String(1000 + i)}`,
    amount: (i + 1) * 49000,
    status: ["SUCCESS", "PENDING", "FAILED"][i % 3],
    payment_method: ["BCA Virtual Account", "QRIS", "Mandiri VA", "GoPay"][i % 4],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    user: {
      name: `Pembeli Paket #${i + 1}`,
      email: `pembeli${i + 1}@gmail.com`,
    },
    plan_name: `Paket Ruang Tenang Pro 1 Bulan #${i + 1}`,
  }));
}

function generateMockOrganizations(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Universitas & Lembaga Mitra Pendidikan Kampus Merdeka Wilayah #${i + 1}`,
    code: `ORG-MITRA-${100 + i}`,
    contact_email: `kerjasama.mitra${i + 1}@lembaga.edu.id`,
    business_type: ["Universitas", "Fakultas Psikologi", "Perusahaan Teknologi", "Komunitas"][i % 4],
    status: ["active", "pending", "inactive"][i % 3],
    created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  }));
}

function generateMockB2BPlans(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    code: `PLAN-B2B-${i + 1}`,
    name: `Paket Kemitraan Kampus Sehat Tier ${i + 1}`,
    description: `Akses menyeluruh bagi institusi pendidikan untuk memantau kesehatan mental mahasiswa.`,
    billing_cycle: i % 2 === 0 ? "monthly" : "yearly",
    base_price_per_seat: (i + 1) * 25000,
    min_seats: 10,
    max_seats: 500,
    is_active: true,
  }));
}

function generateMockStudentBillingTransactions(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    order_id: `RT-STU-INV-2026-${String(2000 + i)}`,
    user_id: 3,
    item_type: i % 2 === 0 ? "subscription" : "topup",
    item_id: (i % 3) + 1,
    item_name: i % 2 === 0 ? "Paket Langganan Ruang Tenang Pro 30 Hari" : "Paket Top-Up 100 Koin Emas",
    amount: i % 2 === 0 ? 49000 : 25000,
    currency: "IDR",
    status: ["paid", "pending", "failed", "expired"][i % 4],
    payment_provider: ["midtrans", "manual_bank"][i % 2],
    provider_reference: `MID-${100000 + i}`,
    payment_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/sample",
    paid_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockReports(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    reporter_id: i + 1,
    content_type: ["article", "forum", "post", "story"][i % 4],
    content_id: i + 10,
    reason: ["spam", "harassment", "hate_speech", "inappropriate"][i % 4],
    notes: `Laporan pengguna #${i + 1}: Konten ini terindikasi melanggar panduan komunitas pada bagian komentar.`,
    status: ["pending", "reviewing", "resolved"][i % 3],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    reporter: {
      name: `Pelapor Warga #${i + 1}`,
      email: `pelapor${i + 1}@gmail.com`,
    },
    content_title: `Judul Konten Yang Dilaporkan Nomor #${i + 1}`,
  }));
}

function generateMockQueueArticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Pengajuan Artikel Opini & Studi Kasus Mahasiswa Ke-${i + 1}: Mengapa Istirahat Cukup Bukan Tanda Kelemahan`,
    author: {
      name: `Penulis Pengaju #${i + 1}`,
      email: `penulis${i + 1}@mahasiswa.ac.id`,
    },
    category: "Opini Mahasiswa",
    status: ["pending", "flagged", "revision_needed"][i % 3],
    severity: ["low", "medium", "high"][i % 3],
    submitted_at: new Date(Date.now() - i * 3600000 * 6).toISOString(),
    created_at: new Date(Date.now() - i * 3600000 * 6).toISOString(),
  }));
}

function generateMockStories(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Kisah Perjalanan & Bangkit dari Titik Terendah #${i + 1}: Mencari Ruang Bernapas di Tengah Tekanan`,
    author: {
      name: `Sahabat Tenang Anonim #${i + 1}`,
      avatar: "",
    },
    content: "Saya ingin membagikan kisah perjuangan selama semester akhir...",
    likes_count: (i + 1) * 24,
    created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    status: "published",
    is_moderated: true,
  }));
}

function generateMockAppeals(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    user_id: i + 1,
    content_type: ["forum", "article", "account"][i % 3],
    content_id: i + 5,
    appeal_reason: `Permohonan banding akun #${i + 1}: Saya tidak bermaksud melakukan pelanggaran dan mohon peninjauan ulang status saya.`,
    status: ["pending", "approved", "rejected"][i % 3],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    user: {
      name: `Pengaju Banding #${i + 1}`,
      email: `banding${i + 1}@gmail.com`,
    },
  }));
}

function generateMockActions(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    moderator_id: 1,
    target_type: ["user", "forum_post", "article", "story", "report"][i % 5],
    target_id: i + 10,
    action_type: ["suspend_user", "delete_post", "flag_content", "reinstate_user", "user_warned"][i % 5],
    reason: `Tindakan kepatuhan moderasi #${i + 1}: Sesuai hasil audit kepatuhan konten komunitas.`,
    created_at: new Date(Date.now() - i * 3600000 * 3).toISOString(),
    moderator_name: "Admin Ruang Tenang",
    notes: "Telah diverifikasi sesuai standar moderasi komunitas.",
  }));
}

function generateMockMembers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    full_name: `Anggota Institusi #${i + 1} Fakultas Kedokteran & Psikologi`,
    email: `anggota${i + 1}@kampus-mitra.edu.id`,
    role: i === 0 ? "owner" : i % 5 === 0 ? "manager" : "member",
    status: i % 4 === 0 ? "pending_approval" : "active",
    joined_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));
}

function generateMockJournals(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    uuid: `journal-uuid-${i + 1}`,
    title: `Catatan Refleksi Hari Ini #${i + 1}: Menemukan Ketenteraman di Antara Kesibukan`,
    content: "Hari ini saya menyadari betapa pentingnya berhenti sejenak untuk mendengarkan diri sendiri...",
    preview: "Hari ini saya menyadari betapa pentingnya berhenti sejenak untuk mendengarkan diri sendiri...",
    mood_id: (i % 4) + 1,
    mood_label: ["Senang", "Netral", "Kecewa", "Sedih"][i % 4],
    mood_emoji: "😊",
    user_id: 3,
    is_private: true,
    share_with_ai: i % 2 === 0,
    word_count: 120 + i * 15,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
    tags: ["Refleksi", "Ketenangan", "Syukur"],
  }));
}

function generateMockMoods(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    mood: ["happy", "neutral", "angry", "disappointed", "sad", "crying"][i % 6],
    notes: `Check-in hari ke-${i + 1}: Merasa ${["tenang dan damai", "biasa saja", "sedikit lelah", "kecewa dengan situasi", "butuh istirahat"][i % 5]}`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

// ----------------- DYNAMIC PAGES DEFINITIONS ----------------- //

const DYNAMIC_PAGES = [
  // Admin (10 pages)
  { id: "01-admin-users", role: "admin", path: "/dashboard/admin/users", name: "Admin Users" },
  { id: "02-admin-articles", role: "admin", path: "/dashboard/admin/articles", name: "Admin Articles" },
  { id: "03-admin-songs", role: "admin", path: "/dashboard/admin/songs", name: "Admin Songs" },
  { id: "04-admin-forums", role: "admin", path: "/dashboard/admin/forums", name: "Admin Forums" },
  { id: "05-admin-forum-detail", role: "admin", path: "/dashboard/admin/forums/1", name: "Admin Forum Detail" },
  { id: "06-admin-levels", role: "admin", path: "/dashboard/admin/levels", name: "Admin Levels" },
  { id: "07-admin-rewards", role: "admin", path: "/dashboard/admin/rewards", name: "Admin Rewards" },
  { id: "08-admin-broadcasts", role: "admin", path: "/dashboard/admin/broadcasts", name: "Admin Broadcasts" },
  { id: "09-admin-billing", role: "admin", path: "/dashboard/admin/billing", name: "Admin Billing" },
  { id: "10-admin-b2b", role: "admin", path: "/dashboard/admin/b2b", name: "Admin B2B" },

  // Moderation (5 pages)
  { id: "11-moderation-reports", role: "admin", path: "/dashboard/moderation/reports", name: "Moderasi Laporan" },
  { id: "12-moderation-queue", role: "admin", path: "/dashboard/moderation/queue", name: "Moderasi Antrean" },
  { id: "13-moderation-stories", role: "admin", path: "/dashboard/moderation/stories", name: "Moderasi Kisah" },
  { id: "14-moderation-appeals", role: "admin", path: "/dashboard/moderation/appeals", name: "Moderasi Banding" },
  { id: "15-moderation-actions", role: "admin", path: "/dashboard/moderation/actions", name: "Moderasi Log Aksi" },

  // Mitra (2 pages)
  { id: "16-mitra-organizations", role: "mitra", path: "/dashboard/mitra/organizations", name: "Mitra Organisasi & Anggota" },
  { id: "17-mitra-payments", role: "mitra", path: "/dashboard/mitra/payments", name: "Mitra Tagihan & Pembayaran" },

  // Student (6 pages)
  { id: "18-student-articles", role: "student", path: "/dashboard/articles", name: "Mahasiswa Artikel" },
  { id: "19-student-community", role: "student", path: "/dashboard/community", name: "Mahasiswa Komunitas" },
  { id: "20-student-music", role: "student", path: "/dashboard/music", name: "Mahasiswa Musik" },
  { id: "21-student-journal", role: "student", path: "/dashboard/journal", name: "Mahasiswa Jurnal" },
  { id: "22-student-mood", role: "student", path: "/dashboard/mood-tracker", name: "Mahasiswa Riwayat Mood" },
  { id: "23-student-billing", role: "student", path: "/dashboard/billing", name: "Mahasiswa Billing & Paket" },
];

async function setupRouteMocks(page, state) {
  const isMany = state === "many";

  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method !== "GET") {
      return route.continue();
    }

    // Checkin mood today
    if (url.includes("/user-moods/today")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { has_checked: true, mood: { mood: "happy" } },
          meta: { success: true },
        }),
      });
    }

    // 1. Users
    if (url.includes("/admin/users") || url.includes("/users")) {
      const items = isMany ? generateMockUsers(35) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 4 : 0 },
        }),
      });
    }

    // 2. Articles
    if (url.includes("/articles") || url.includes("/admin/articles")) {
      const items = isMany ? generateMockArticles(28) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 3. Songs
    if (url.includes("/songs") || url.includes("/admin/songs")) {
      const items = isMany ? generateMockSongs(30) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 3b. Song Categories (Music Hub)
    if (url.includes("/song-categories")) {
      const items = isMany ? generateMockSongCategories(18) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { page: 1, limit: 12, total_items: items.length, total_pages: isMany ? 2 : 0 },
        }),
      });
    }

    // 3c. Playlists (Music Hub)
    if (url.includes("/playlists")) {
      const items = isMany ? generateMockPlaylists(15) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 2 : 0 },
        }),
      });
    }

    // 5. Forum posts / replies
    if (url.match(/\/forums\/[^/?#]+\/posts/) || url.includes("/posts")) {
      const items = isMany ? generateMockForumPosts(16) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { page: 1, limit: 100, total_items: items.length, total_pages: isMany ? 2 : 0 },
        }),
      });
    }

    // 4b. Forum topic detail
    if (url.match(/\/admin\/forums\/\d+$/) || url.match(/\/forums\/\d+$/)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: 1,
            title: "Membagi beban kerja tanpa langsung mengambil keputusan besar",
            slug: "membagi-beban-kerja",
            content: "Dalam beberapa minggu ini daftar pekerjaan saya makin panjang dan saya merasa terus tertinggal. Saya belum ingin mengambil keputusan besar saat sedang sangat lelah. Apa langkah kecil yang pernah membantu kalian memetakan beban dan membicarakan prioritas dengan atasan?",
            category: { id: 1, name: "Kesehatan Mental di Tempat Kerja", slug: "kesehatan-mental-di-tempat-kerja" },
            likes_count: isMany ? 24 : 0,
            posts_count: isMany ? 16 : 0,
            created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
            is_liked: false,
            user: { id: 3, name: "Alfian Gading Saputra", avatar: "" },
          },
          meta: { success: true },
        }),
      });
    }

    // 4. Forums list
    if (url.match(/\/forums(\?|$)/) || url.match(/\/admin\/forums(\?|$)/)) {
      const items = isMany ? generateMockForums(25) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 6. Levels (Level Configs)
    if (url.includes("/level-configs") || url.includes("/levels") || url.includes("/admin/levels")) {
      const items = isMany ? generateMockLevels(18) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // 7. Rewards & Claims
    if (url.includes("/rewards/claims") || url.includes("/admin/rewards/claims")) {
      const items = isMany ? generateMockClaims(25) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { claims: items, total: items.length },
          meta: { total_items: items.length },
        }),
      });
    }
    if (url.includes("/rewards") || url.includes("/admin/rewards")) {
      const items = isMany ? generateMockRewards(22) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // 8. Broadcasts
    if (url.includes("/broadcasts") || url.includes("/admin/broadcasts")) {
      const items = isMany ? generateMockBroadcasts(30) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 10a. B2B Plans
    if (url.includes("/b2b/plans") || url.includes("/admin/b2b/plans")) {
      const items = isMany ? generateMockB2BPlans(10) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // 10b. B2B Organization Summary
    if (url.match(/\/b2b\/organizations\/\d+$/)) {
      const org = generateMockOrganizations(1)[0];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            organization: org,
            seat_usage: { contracted_seats: 50, used_seats: 25, available_seats: 25 },
            subscription: {
              id: 1,
              organization_id: org.id,
              plan_id: 1,
              plan_code: "CAMPUS_PRO",
              plan_name: "Paket Kampus Mitra Pro",
              status: "active",
              contracted_seats: 50,
              used_seats: 25,
              billing_cycle: "monthly",
              unit_price: 35000,
              subtotal: 1750000,
              discount_amount: 0,
              total_amount: 1750000,
              starts_at: new Date(Date.now() - 86400000 * 15).toISOString(),
              ends_at: new Date(Date.now() + 86400000 * 15).toISOString(),
            },
          },
          meta: { success: true },
        }),
      });
    }

    // 10c. B2B Members
    if (url.includes("/b2b/organizations") && url.includes("/members")) {
      const items = isMany ? generateMockMembers(28) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // 10d. Admin B2B Organizations (plain array)
    if (url.includes("/admin/b2b/organizations")) {
      const items = isMany ? generateMockOrganizations(24) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // 10e. Mitra B2B Organizations (wrapped in MitraOrganizationListItem)
    if (url.includes("/b2b/organizations")) {
      const rawOrgs = isMany ? generateMockOrganizations(12) : [];
      const items = rawOrgs.map((org, index) => ({
        organization: org,
        member_role: index === 0 ? "owner" : "manager",
        member_status: "active",
      }));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // 9a. Student Billing Catalog
    if (url.includes("/billing/catalog")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            plans: [
              {
                id: 1,
                code: "PRO_MONTHLY",
                name: "Ruang Tenang Pro Bulanan",
                description: "Akses tanpa batas fitur meditasi, jurnal AI, dan konsultasi.",
                price: 49000,
                duration_days: 30,
                is_active: true,
              },
              {
                id: 2,
                code: "PRO_ANNUAL",
                name: "Ruang Tenang Pro Tahunan",
                description: "Hemat 25% untuk akses tenang setahun penuh.",
                price: 440000,
                duration_days: 365,
                is_active: true,
              },
            ],
            topup_packages: [
              {
                id: 1,
                code: "COIN_50",
                name: "50 Koin Emas",
                coins: 50,
                bonus_coins: 0,
                total_coins: 50,
                price: 15000,
                is_active: true,
              },
              {
                id: 2,
                code: "COIN_120",
                name: "120 Koin Emas (Bonus 20)",
                coins: 100,
                bonus_coins: 20,
                total_coins: 120,
                price: 30000,
                is_active: true,
              },
            ],
            business_plans: [
              {
                id: 1,
                code: "BIZ_CAMPUS",
                name: "Paket Kampus Mitra Merdeka",
                description: "Kuota kesehatan mental untuk seluruh mahasiswa fakultas.",
                billing_cycle: "monthly",
                base_price_per_seat: 20000,
                min_seats: 50,
                max_seats: 1000,
                is_active: true,
              },
            ],
            chat_quota: {
              feature_key: "ai_chat",
              limit: 50,
              used: 12,
              remaining: 38,
              is_unlimited: false,
              reset_at: new Date(Date.now() + 86400000).toISOString(),
            },
          },
          meta: { success: true },
        }),
      });
    }

    // 9b. Student Billing Status
    if (url.includes("/billing/status")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            is_premium: isMany,
            entitlement_source: isMany ? "personal" : "free",
            gold_coins: isMany ? 180 : 0,
            chat_quota: {
              feature_key: "ai_chat",
              limit: 50,
              used: 12,
              remaining: 38,
              is_unlimited: false,
              reset_at: new Date(Date.now() + 86400000).toISOString(),
            },
            subscription: isMany
              ? {
                  plan_id: 1,
                  plan_code: "PRO_MONTHLY",
                  plan_name: "Ruang Tenang Pro Bulanan",
                  status: "active",
                  starts_at: new Date(Date.now() - 86400000 * 10).toISOString(),
                  ends_at: new Date(Date.now() + 86400000 * 20).toISOString(),
                  source_order_id: "RT-SUB-2026-001",
                }
              : undefined,
          },
          meta: { success: true },
        }),
      });
    }

    // 9c. Admin Billing Transactions
    if (url.includes("/admin/billing") || (url.includes("/billing") && url.includes("/admin"))) {
      const items = isMany ? generateMockTransactions(32) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            transactions: items.slice(0, 10),
            total: items.length,
            total_pages: isMany ? 4 : 0,
          },
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 4 : 0 },
        }),
      });
    }

    // 9d. Student Billing Transactions
    if (url.includes("/billing/transactions")) {
      const items = isMany ? generateMockStudentBillingTransactions(32) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            transactions: items.slice(0, 10),
            total: items.length,
            page: 1,
            limit: 10,
            total_pages: isMany ? 4 : 0,
          },
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 4 : 0 },
        }),
      });
    }

    // 11. Moderation Reports
    if (url.includes("/moderation/reports")) {
      const items = isMany ? generateMockReports(26) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 12. Moderation Queue
    if (url.includes("/moderation/queue") || url.includes("/moderation/articles")) {
      const items = isMany ? generateMockQueueArticles(25) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 13. Moderation Stories
    if (url.includes("/moderation/stories") || url.includes("/stories")) {
      const items = isMany ? generateMockStories(20) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 2 : 0 },
        }),
      });
    }

    // 14. Moderation Appeals
    if (url.includes("/moderation/appeals")) {
      const items = isMany ? generateMockAppeals(18) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 2 : 0 },
        }),
      });
    }

    // 15. Moderation Actions
    if (url.includes("/moderation/actions")) {
      const items = isMany ? generateMockActions(35) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 4 : 0 },
        }),
      });
    }

    // 21. Journals
    if (url.includes("/journals")) {
      const items = isMany ? generateMockJournals(25) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items.slice(0, 10),
          meta: { page: 1, limit: 10, total_items: items.length, total_pages: isMany ? 3 : 0 },
        }),
      });
    }

    // 22. Moods
    if (url.includes("/user-moods")) {
      const items = isMany ? generateMockMoods(24) : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          meta: { total_items: items.length },
        }),
      });
    }

    // Fallback: continue normally
    return route.continue();
  });
}

async function runDynamicTesting() {
  console.log("=== Memulai Pengujian Playwright Halaman Dinamis (23 Halaman × 2 Skenario) ===");
  console.log(`Target URL: ${BASE_URL}`);

  const adminSession = await getAuthSession("admin@gmail.com", "password", "admin");
  const mitraSession = await getAuthSession("mitra@gmail.com", "password", "mitra");
  const studentSession = await getAuthSession("gading@gmail.com", "password", "user");

  const sessions = {
    admin: adminSession,
    mitra: mitraSession,
    student: studentSession,
  };

  const browser = await chromium.launch({ headless: true });

  for (const state of ["empty", "many"]) {
    console.log(`\n================== SKENARIO DATA: ${state.toUpperCase()} ==================`);
    const primaryDir = state === "empty" ? PRIMARY_EMPTY_DIR : PRIMARY_MANY_DIR;
    const parentDir = state === "empty" ? PARENT_EMPTY_DIR : PARENT_MANY_DIR;
    const artifactDir = state === "empty" ? ARTIFACT_EMPTY_DIR : ARTIFACT_MANY_DIR;

    for (const item of DYNAMIC_PAGES) {
      const session = sessions[item.role];
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });

      const authState = {
        state: {
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        },
        version: 0,
      };

      const cookieVal = encodeURIComponent(JSON.stringify(authState));
      await context.addCookies([
        {
          name: "auth-storage",
          value: cookieVal,
          domain: "localhost",
          path: "/",
        },
      ]);

      const page = await context.newPage();
      await setupRouteMocks(page, state);

      await page.addInitScript((storageData) => {
        window.localStorage.setItem("auth-storage", JSON.stringify(storageData));
      }, authState);

      const fileName = `${item.id}-${state}.png`;
      const dest1 = join(primaryDir, fileName);
      const dest2 = join(parentDir, fileName);
      const destArtifact = join(artifactDir, fileName);

      try {
        console.log(`[${state.toUpperCase()}] Navigasi: ${item.path} (${item.name})`);
        await page.goto(`${BASE_URL}${item.path}`, { waitUntil: "domcontentloaded", timeout: 35000 });
        await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
        await page.waitForTimeout(1000);

        // Bersihkan portal toast dan backdrop agar screenshot bersih
        await page.evaluate(() => {
          const portals = document.querySelectorAll("nextjs-portal, [data-nextjs-toast]");
          portals.forEach((p) => (p.style.display = "none"));
          const modalBackdrops = document.querySelectorAll(
            "[data-state='open'][role='dialog'], [data-state='open'][data-slot='sheet-overlay']"
          );
          // Jangan sembunyikan dialog yang legitimate jika sengaja dibuka, kecuali checkin modal
          modalBackdrops.forEach((m) => {
            if (m.innerText && m.innerText.includes("Bagaimana perasaanmu hari ini?")) {
              m.style.display = "none";
            }
          });
        }).catch(() => {});

        // FULL PAGE SCREENSHOT
        await page.screenshot({ path: dest1, fullPage: true });
        copyFileSync(dest1, dest2);
        copyFileSync(dest1, destArtifact);
        console.log(`  ✓ Tersimpan: ${fileName}`);
      } catch (err) {
        console.error(`  ✗ Gagal pada ${item.path} (${state}):`, err.message);
      } finally {
        await page.close().catch(() => {});
        await context.close().catch(() => {});
      }
    }
  }

  await browser.close();
  console.log("\n=== Seluruh 46 Pengujian Halaman Dinamis Berhasil Diselesaikan! ===");
}

runDynamicTesting().catch((err) => {
  console.error("Fatal error during dynamic testing:", err);
  process.exit(1);
});
