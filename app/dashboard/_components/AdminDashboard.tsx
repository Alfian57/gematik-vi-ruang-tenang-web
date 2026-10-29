"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";
import { useAdminDashboard } from "../_hooks/useAdminDashboard";
import { AdminAlertCards } from "./admin/AdminAlertCards";
import { AdminStatsCards } from "./admin/AdminStatsCards";
import { AdminQuickActions } from "./admin/AdminQuickActions";
import { AdminSummaryCards } from "./admin/AdminSummaryCards";

export function AdminDashboard() {
  const { user, stats, isLoading } = useAdminDashboard();
  const adminDisplayName = user?.name?.trim() || "Admin";

  return (
    <div className="py-2 lg:py-4">
      {/* Hero Banner */}
      <AdminMascotHero
        eyebrow="Pusat Kontrol Sistem"
        title={`Selamat Datang, ${adminDisplayName}!`}
        description="Pantau performa platform, kelola pengguna, moderasi konten, dan jaga keamanan ekosistem Ruang Tenang."
        image="/images/landing/mascot/welcome.webp"
        imageAlt="Maskot RuNa menyambut Administrator"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-3.5 sm:p-4">
                <div className="h-14 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <>
          <AdminAlertCards stats={stats} />
          <AdminStatsCards stats={stats} />
          <AdminQuickActions stats={stats} />
          <AdminSummaryCards stats={stats} />
        </>
      )}
    </div>
  );
}
