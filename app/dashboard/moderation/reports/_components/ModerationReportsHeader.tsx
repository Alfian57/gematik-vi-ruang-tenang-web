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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    Search,
    Filter,
    Clock,
    Eye,
    CheckCircle2,
    AlertCircle,
    FileText,
    MessageSquare,
    User,
    BookOpen,
    MessageCircle,
} from "lucide-react";
import { ReportStatus, ReportType } from "@/types/moderation";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", icon: Clock },
    reviewing: { label: "Ditinjau", color: "bg-primary/10 text-primary dark:bg-primary dark:text-primary/60", icon: Eye },
    resolved: { label: "Selesai", color: "bg-primary/10 text-primary dark:bg-primary dark:text-primary/60", icon: CheckCircle2 },
    dismissed: { label: "Ditolak", color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300", icon: AlertCircle },
};

const TYPE_CONFIG: Record<ReportType, { label: string; icon: React.ElementType }> = {
    article: { label: "Artikel", icon: FileText },
    forum: { label: "Forum", icon: MessageSquare },
    forum_post: { label: "Postingan", icon: MessageSquare },
    user: { label: "Pengguna", icon: User },
    story: { label: "Kisah Inspiratif", icon: BookOpen },
    story_comment: { label: "Komentar Kisah", icon: MessageCircle },
};

interface ModerationReportsHeaderProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    reasonFilter: string;
    setReasonFilter: (value: string) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    isLoading: boolean;
    onRefresh: () => void;
}

const REASON_CONFIG: Record<string, string> = {
    misinformation: "Informasi Keliru",
    harmful: "Konten Berbahaya",
    harassment: "Pelecehan",
    spam: "Spam",
    impersonation: "Penyamaran",
    other: "Lainnya",
};

export function ModerationReportsHeader({
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    reasonFilter,
    setReasonFilter,
    searchQuery,
    setSearchQuery,
}: ModerationReportsHeaderProps) {
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
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Laporan Masuk</span>
                    </div>
                }
                title="Laporan Pengguna"
                description="Tinjau dan tindak lanjuti laporan konten tidak pantas atau pelanggaran panduan komunitas."
                image="/images/landing/mascot/listen.webp"
                imageAlt="Maskot RuNa meninjau laporan pengguna"
            />

            {/* Filters */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                            placeholder="Cari berdasarkan konten atau pengguna..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 bg-white rounded-xl border-slate-200"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3.5 text-slate-700 hover:bg-slate-50 shrink-0">
                                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                                {statusFilter === "all" ? "Semua Status" : STATUS_CONFIG[statusFilter as ReportStatus]?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                                Semua Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                                        <Icon className="h-4 w-4 mr-2" />
                                        {config.label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3.5 text-slate-700 hover:bg-slate-50 shrink-0">
                                {typeFilter === "all" ? "Semua Tipe" : TYPE_CONFIG[typeFilter as ReportType]?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                                Semua Tipe
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <DropdownMenuItem key={key} onClick={() => setTypeFilter(key)}>
                                        <Icon className="h-4 w-4 mr-2" />
                                        {config.label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3.5 text-slate-700 hover:bg-slate-50 shrink-0">
                                {reasonFilter === "all" ? "Semua Alasan" : REASON_CONFIG[reasonFilter]}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setReasonFilter("all")}>
                                Semua Alasan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {Object.entries(REASON_CONFIG).map(([key, label]) => (
                                <DropdownMenuItem key={key} onClick={() => setReasonFilter(key)}>
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

export { STATUS_CONFIG, TYPE_CONFIG };
