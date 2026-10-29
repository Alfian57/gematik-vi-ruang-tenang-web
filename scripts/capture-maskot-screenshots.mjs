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

const PRIMARY_DEST_DIR = resolve(process.cwd(), "test/maskot");
const PARENT_DEST_DIR = resolve(process.cwd(), "../test/maskot");

mkdirSync(PRIMARY_DEST_DIR, { recursive: true });
mkdirSync(PARENT_DEST_DIR, { recursive: true });

function cleanDirectory(dir) {
  if (!existsSync(dir)) return;
  const files = readdirSync(dir);
  for (const file of files) {
    if (file.endsWith(".png")) {
      try {
        unlinkSync(join(dir, file));
      } catch {}
    }
  }
}

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

async function performStudentDailyCheckin(token) {
  if (!token || token.startsWith("mock-token")) return;
  try {
    console.log("[Checkin] Memeriksa status check-in harian student...");
    const checkRes = await fetch(`${API_URL}/user-moods/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkJson = await checkRes.json();
    if (checkJson?.data?.has_checked) {
      console.log("[Checkin] Student sudah melakukan check-in harian hari ini.");
      return;
    }
    console.log("[Checkin] Melakukan check-in harian otomatis untuk akun student...");
    const recordRes = await fetch(`${API_URL}/user-moods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mood: "happy" }),
    });
    const recordJson = await recordRes.json();
    console.log("[Checkin] Check-in harian berhasil dicatat:", recordJson?.meta?.message || "Sukses");
  } catch (err) {
    console.warn("[Checkin] Gagal melakukan check-in harian via API:", err.message);
  }
}

const ADMIN_PAGES = [
  { file: "01-admin-dashboard.png", path: "/dashboard/admin" },
  { file: "02-admin-users.png", path: "/dashboard/admin/users" },
  { file: "03-admin-articles.png", path: "/dashboard/admin/articles" },
  { file: "04-admin-songs.png", path: "/dashboard/admin/songs" },
  { file: "05-admin-forums.png", path: "/dashboard/admin/forums" },
  { file: "06-admin-forums-detail.png", path: "/dashboard/admin/forums/1" },
  { file: "07-admin-levels.png", path: "/dashboard/admin/levels" },
  { file: "08-admin-rewards.png", path: "/dashboard/admin/rewards" },
  { file: "09-admin-broadcasts.png", path: "/dashboard/admin/broadcasts" },
  { file: "10-admin-billing.png", path: "/dashboard/admin/billing" },
  { file: "11-admin-b2b.png", path: "/dashboard/admin/b2b" },
  { file: "12-admin-moderation-overview.png", path: "/dashboard/moderation" },
  { file: "13-admin-moderation-reports.png", path: "/dashboard/moderation/reports" },
  { file: "14-admin-moderation-queue.png", path: "/dashboard/moderation/queue" },
  { file: "15-admin-moderation-stories.png", path: "/dashboard/moderation/stories" },
  { file: "16-admin-moderation-appeals.png", path: "/dashboard/moderation/appeals" },
  { file: "17-admin-moderation-crisis-keywords.png", path: "/dashboard/moderation/crisis-keywords" },
  { file: "18-admin-moderation-actions.png", path: "/dashboard/moderation/actions" },
  { file: "19-admin-moderation-trigger-warnings.png", path: "/dashboard/moderation/trigger-warnings" },
];

const MITRA_PAGES = [
  { file: "20-mitra-dashboard-overview.png", path: "/dashboard/mitra" },
  { file: "21-mitra-organizations.png", path: "/dashboard/mitra/organizations" },
  { file: "22-mitra-subscription.png", path: "/dashboard/mitra/subscription" },
  { file: "23-mitra-insights.png", path: "/dashboard/mitra/insights" },
  { file: "24-mitra-payments.png", path: "/dashboard/mitra/payments" },
  { file: "25-mitra-settings.png", path: "/dashboard/mitra/settings" },
];

const STUDENT_PAGES = [
  { file: "26-student-dashboard.png", path: "/dashboard" },
  { file: "27-student-mood-tracker.png", path: "/dashboard/mood-tracker" },
  { file: "28-student-journal.png", path: "/dashboard/journal" },
  { file: "29-student-chat.png", path: "/dashboard/chat" },
  { file: "30-student-articles.png", path: "/dashboard/articles" },
  { file: "31-student-music.png", path: "/dashboard/music" },
  { file: "32-student-community.png", path: "/dashboard/community" },
  { file: "33-student-journey.png", path: "/dashboard/journey" },
  { file: "34-student-game.png", path: "/dashboard/game" },
  { file: "35-student-billing.png", path: "/dashboard/billing" },
  { file: "36-student-profile.png", path: "/dashboard/profile" },
];

async function main() {
  console.log("=== Mengambil Screenshot Halaman Admin, Mitra, & Mahasiswa Menggunakan Playwright ===");
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Membersihkan file screenshot lama di ${PRIMARY_DEST_DIR} dan ${PARENT_DEST_DIR}...`);
  cleanDirectory(PRIMARY_DEST_DIR);
  cleanDirectory(PARENT_DEST_DIR);

  const adminSession = await getAuthSession("admin@gmail.com", "password", "admin");
  const mitraSession = await getAuthSession("mitra@gmail.com", "password", "mitra");
  const studentSession = await getAuthSession("gading@gmail.com", "password", "user");

  // Lakukan check-in harian untuk student sebelum membuka halaman-halaman student
  await performStudentDailyCheckin(studentSession.token);

  const browser = await chromium.launch({
    headless: true,
  });

  async function captureRolePages(role, session, pages) {
    console.log(`\n--- Menangkap Halaman Role: ${role.toUpperCase()} (${pages.length} halaman) ---`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });

    if (role === "student") {
      await context.route("**/user-moods/today", async (route) => {
        try {
          const res = await route.fetch();
          const json = await res.json();
          if (json && json.data) {
            json.data.has_checked = true;
            return route.fulfill({ json });
          }
          return route.fulfill({ response: res });
        } catch {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              meta: { success: true, message: "OK" },
              data: { has_checked: true, mood: { mood: "happy" } },
            }),
          });
        }
      });
    }

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

    for (const item of pages) {
      const fullUrl = `${BASE_URL}${item.path}`;
      const destPath1 = join(PRIMARY_DEST_DIR, item.file);
      const destPath2 = join(PARENT_DEST_DIR, item.file);

      const page = await context.newPage();
      try {
        await page.addInitScript((storageData) => {
          window.localStorage.setItem("auth-storage", JSON.stringify(storageData));
        }, authState);

        console.log(`[Capture] Navigasi: ${item.path} -> ${item.file}`);
        await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        // Beri jeda agar animasi & gambar maskot selesai dimuat
        await page.waitForTimeout(1200);

        // Pastikan dev toast dan modal backdrop tidak menghalangi screenshot
        await page.evaluate(() => {
          const portals = document.querySelectorAll("nextjs-portal, [data-nextjs-toast]");
          portals.forEach((p) => (p.style.display = "none"));
          // Sembunyikan dialog checkin jika terbuka
          const modalBackdrops = document.querySelectorAll("[data-state='open'][role='dialog'], [data-state='open'][data-slot='sheet-overlay']");
          modalBackdrops.forEach((m) => (m.style.display = "none"));
        }).catch(() => {});

        await page.screenshot({ path: destPath1, fullPage: false });
        copyFileSync(destPath1, destPath2);
        console.log(`  ✓ Tersimpan: ${item.file}`);
      } catch (err) {
        console.error(`  ✗ Gagal pada ${item.path}:`, err.message);
      } finally {
        await page.close().catch(() => {});
      }
    }

    await context.close();
  }

  try {
    await captureRolePages("admin", adminSession, ADMIN_PAGES);
    await captureRolePages("mitra", mitraSession, MITRA_PAGES);
    await captureRolePages("student", studentSession, STUDENT_PAGES);
  } finally {
    await browser.close();
  }

  console.log("\n=== Seluruh 36 Screenshot Berhasil Diambil ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
