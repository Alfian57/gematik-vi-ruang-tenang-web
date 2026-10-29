"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    Search,
    Filter,
    Clock,
    AlertTriangle,
    FileText,
} from "lucide-react";
import { ArticleModerationStatus } from "@/types/moderation";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";

const STATUS_LABELS: Record<ArticleModerationStatus, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    flagged: { label: "Ditandai", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    approved: { label: "Disetujui", color: "bg-primary/10 text-primary dark:bg-primary dark:text-primary/60" },
    rejected: { label: "Ditolak", color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" },
    revision_needed: { label: "Perlu Revisi", color: "bg-primary/10 text-primary dark:bg-primary dark:text-primary/60" },
};

interface ModerationQueueHeaderProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    severityFilter: string;
    setSeverityFilter: (value: string) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    isLoading: boolean;
    onRefresh: () => void;
}

const SEVERITY_LABELS: Record<string, string> = {
    all: "Semua Severity",
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
};

export function ModerationQueueHeader({
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    searchQuery,
    setSearchQuery,
}: ModerationQueueHeaderProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <AdminMascotHero
                eyebrow={
                    <div className="flex items-center gap-1.5">
                        <Button asChild variant="ghost" size="icon" className="h-6 w-6 rounded-full -ml-1 text-slate-600 hover:text-slate-900">
                            <Link href={ROUTES.ADMIN.MODERATION}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Pemeriksaan Konten</span>
                    </div>
                }
                title="Antrean Moderasi Artikel"
                description="Tinjau dan moderasi artikel yang dikirim oleh pengguna sebelum dipublikasikan ke komunitas."
                image="/images/landing/mascot/read.webp"
                imageAlt="Maskot RuNa membaca artikel antrean"
            />

            {/* Filters */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                            placeholder="Cari berdasarkan judul atau penulis..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 bg-white rounded-xl border-slate-200"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3.5 text-slate-700 hover:bg-slate-50 shrink-0">
                                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                                {statusFilter === "all"
                                    ? "Semua Status"
                                    : STATUS_LABELS[statusFilter as ArticleModerationStatus]?.label ||
                                      statusFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                                Semua Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                Menunggu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("flagged")}>
                                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                Ditandai
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("revision_needed")}>
                                <FileText className="h-4 w-4 mr-2 text-primary/80" />
                                Perlu Revisi
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3.5 text-slate-700 hover:bg-slate-50 shrink-0">
                                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                                {SEVERITY_LABELS[severityFilter] || "Semua Severity"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSeverityFilter("all")}>
                                Semua Severity
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSeverityFilter("low")}>
                                Rendah
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSeverityFilter("medium")}>
                                Sedang
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSeverityFilter("high")}>
                                Tinggi
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

// Re-export STATUS_LABELS to be used in items as well if needed
export { STATUS_LABELS };
