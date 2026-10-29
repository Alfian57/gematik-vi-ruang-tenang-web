"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FileText,
    Flag,
    Shield,
    BookOpen,
    Gavel,
    ShieldAlert,
    ScrollText,
    AlertTriangle,
    Layers,
    ChevronRight,
} from "lucide-react";
import { useModerationDashboard } from "./_hooks/useModerationDashboard";
import { ModerationStatsGrid } from "./_components/ModerationStatsGrid";
import { ModerationPendingArticles } from "./_components/ModerationPendingArticles";
import { ModerationRecentReports } from "./_components/ModerationRecentReports";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";

export default function ModerationDashboardPage() {
    const [showQuickNavModal, setShowQuickNavModal] = useState(false);
    const {
        isAdmin,
        stats,
        pendingArticles,
        recentReports,
        isLoading,
    } = useModerationDashboard();

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
                        <p className="text-muted-foreground">
                            Anda tidak memiliki izin untuk mengakses halaman ini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-2 lg:py-4">
            {/* Hero Banner */}
            <AdminMascotHero
                eyebrow="Keselamatan Komunitas"
                title="Dashboard Moderasi"
                description="Pantau antrean laporan, tangani eskalasi krisis, dan pastikan ruang aman bagi seluruh pengguna."
                image="/images/landing/mascot/listen.webp"
                imageAlt="Maskot RuNa mendengarkan laporan moderasi"
            />

            {/* Quick Actions Header Toolbar (Outside Banner) */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Pusat Kendali Moderasi</h2>
                    <p className="text-sm text-gray-500">Ringkasan status antrean konten, laporan pengguna, dan eskalasi krisis.</p>
                </div>
                <Button
                    onClick={() => setShowQuickNavModal(true)}
                    className="gradient-primary text-white rounded-xl shadow-sm shrink-0"
                >
                    <Layers className="w-4 h-4 mr-2" />
                    Aksi Cepat
                </Button>
            </div>

            {/* Quick Navigation Modal */}
            <Dialog open={showQuickNavModal} onOpenChange={setShowQuickNavModal}>
                <DialogContent className="max-w-2xl rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Layers className="w-5 h-5 text-primary" />
                            Aksi Cepat & Navigasi Moderasi
                        </DialogTitle>
                        <DialogDescription>
                            Pilih modul moderasi yang ingin Anda kelola dan tinjau segera.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Link
                            href={ROUTES.ADMIN.MODERATION_QUEUE}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Antrian Moderasi</h4>
                                    <p className="text-xs text-slate-500">Tinjau artikel tertunda</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>

                        <Link
                            href={ROUTES.ADMIN.MODERATION_REPORTS}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <Flag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Laporan Pengguna</h4>
                                    <p className="text-xs text-slate-500">Tangani aduan konten</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>

                        <Link
                            href={ROUTES.ADMIN.MODERATION_APPEALS}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <Gavel className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Banding Pengguna</h4>
                                    <p className="text-xs text-slate-500">Tinjau banding sanksi</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>

                        <Link
                            href={ROUTES.ADMIN.MODERATION_STORIES}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Kisah Komunitas</h4>
                                    <p className="text-xs text-slate-500">Kurasi kisah inspiratif</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>

                        <Link
                            href={ROUTES.ADMIN.MODERATION_CRISIS_KEYWORDS}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Kata Kunci Krisis</h4>
                                    <p className="text-xs text-slate-500">Kamus deteksi darurat</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>

                        <Link
                            href={ROUTES.ADMIN.MODERATION_ACTIONS}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <ScrollText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Log Riwayat Aksi</h4>
                                    <p className="text-xs text-slate-500">Audit jejak tindakan</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>

                        <Link
                            href={ROUTES.ADMIN.MODERATION_TRIGGER_WARNINGS}
                            onClick={() => setShowQuickNavModal(false)}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/30 transition shadow-xs sm:col-span-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-primary/10 group-hover:text-primary transition">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition">Label Trigger Warning</h4>
                                    <p className="text-xs text-slate-500">Kelola peringatan konten sensitif</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>

            <ModerationStatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModerationPendingArticles articles={pendingArticles} isLoading={isLoading} />
                <ModerationRecentReports reports={recentReports} isLoading={isLoading} />
            </div>
        </div>
    );
}
