"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ScrollText } from "lucide-react";
import { formatDateTime } from "@/utils";
import { useModeratorActions } from "./_hooks/useModeratorActions";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";

const ACTION_LABELS: Record<string, string> = {
  article_approved: "Artikel Disetujui",
  article_rejected: "Artikel Ditolak",
  article_request_edit: "Artikel Minta Revisi",
  content_removed: "Konten Dihapus",
  delete_post: "Postingan Dihapus",
  flag_content: "Konten Ditandai",
  user_warned: "Pengguna Diperingatkan",
  user_suspended: "Pengguna Disuspensi",
  suspend_user: "Pengguna Disuspensi",
  user_banned: "Pengguna Diblokir",
  ban_user: "Pengguna Diblokir",
  user_unbanned: "Blokir Dicabut",
  reinstate_user: "Akses Pengguna Dipulihkan",
  strike_issued: "Strike Diberikan",
  strike_removed: "Strike Dicabut",
  report_dismissed: "Laporan Ditolak",
  report_resolved: "Laporan Diselesaikan",
  trigger_warning_added: "Trigger Warning Ditambahkan",
};

const TARGET_LABELS: Record<string, string> = {
  article: "Artikel",
  story: "Kisah",
  forum_post: "Postingan Forum",
  user: "Pengguna",
  report: "Laporan",
};

function formatActionLabel(type: string = ""): string {
  if (!type) return "Aksi";
  if (ACTION_LABELS[type]) return ACTION_LABELS[type];
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatTargetLabel(type: string = ""): string {
  if (!type) return "Target";
  if (TARGET_LABELS[type]) return TARGET_LABELS[type];
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const ACTION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Aksi" },
  ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

const TARGET_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Target" },
  ...Object.entries(TARGET_LABELS).map(([value, label]) => ({ value, label })),
];

function actionVariant(actionType: string = ""): "success" | "destructive" | "warning" | "info" | "muted" {
  const safeType = actionType || "";
  if (safeType.includes("approved") || safeType.includes("resolved") || safeType.includes("unbanned")) return "success";
  if (safeType.includes("rejected") || safeType.includes("banned") || safeType.includes("removed") || safeType.includes("suspended")) return "destructive";
  if (safeType.includes("warned") || safeType.includes("strike") || safeType.includes("request_edit")) return "warning";
  return "info";
}

export default function ModeratorActionsPage() {
  const {
    actions,
    isLoading,
    totalPages,
    page,
    actionType,
    targetType,
    setActionType,
    setTargetType,
    setPage,
  } = useModeratorActions();

  return (
    <div className="space-y-6 py-2 lg:py-4">
      {/* Hero Banner */}
      <AdminMascotHero
        eyebrow={
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="icon" className="h-6 w-6 rounded-full -ml-1 text-slate-600 hover:text-slate-900">
              <Link href={ROUTES.ADMIN.MODERATION} aria-label="Kembali ke dashboard moderasi">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Audit Trail</span>
          </div>
        }
        title="Log Aksi Moderator"
        description="Rekam jejak tindakan moderasi dan riwayat penegakan aturan komunitas secara transparan."
        image="/images/landing/mascot/secure.webp"
        imageAlt="Maskot RuNa audit keamanan"
      />

      <Card className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Riwayat Aksi ({actions.length})</CardTitle>
            <CardDescription>Catatan setiap tindakan yang diambil moderator.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="w-full sm:w-[170px] bg-white rounded-xl">
                <SelectValue placeholder="Jenis Aksi" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white rounded-xl">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
              ))}
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-16">
              <ScrollText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada aksi</h3>
              <p className="text-gray-400 text-sm mt-1">Tidak ada aksi moderator untuk filter ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionVariant(action.action_type)}>
                        {formatActionLabel(action.action_type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTargetLabel(action.target_type)} #{action.target_id}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Oleh <span className="font-medium">{action.moderator_name}</span>
                    </p>
                    {action.reason && (
                      <p className="text-xs text-muted-foreground mt-1">Alasan: {action.reason}</p>
                    )}
                    {action.notes && (
                      <p className="text-xs text-muted-foreground">Catatan: {action.notes}</p>
                    )}
                    {(action.previous_state || action.new_state) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.previous_state || "-"} → {action.new_state || "-"}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(action.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
