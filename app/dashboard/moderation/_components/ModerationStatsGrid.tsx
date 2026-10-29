import Link from "next/link";
import { Clock, AlertTriangle, Flag, CheckCircle2, XCircle, Users, Ban } from "lucide-react";
import { ModerationStats } from "@/types/moderation";
import { ROUTES } from "@/lib/routes";

interface ModerationStatsGridProps {
    stats: ModerationStats | null;
}

export function ModerationStatsGrid({ stats }: ModerationStatsGridProps) {
    const statCards = [
        {
            label: "Artikel Pending",
            value: stats?.pending_articles ?? "-",
            subtitle: "Menunggu moderasi",
            icon: Clock,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
            statusColor: "text-amber-600",
            href: ROUTES.ADMIN.MODERATION_QUEUE,
        },
        {
            label: "Artikel Ditandai",
            value: stats?.flagged_articles ?? "-",
            subtitle: "Perlu ditinjau",
            icon: AlertTriangle,
            iconBg: "bg-red-500/10",
            iconColor: "text-red-600",
            statusColor: "text-red-600",
            href: ROUTES.ADMIN.MODERATION_QUEUE,
        },
        {
            label: "Laporan Pending",
            value: stats?.pending_reports ?? "-",
            subtitle: "Menunggu penanganan",
            icon: Flag,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            statusColor: "text-primary",
            href: ROUTES.ADMIN.MODERATION_REPORTS,
        },
        {
            label: "Selesai Hari Ini",
            value: stats?.resolved_reports_today ?? "-",
            subtitle: "Laporan terselesaikan",
            icon: CheckCircle2,
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
            statusColor: "text-emerald-600",
            href: ROUTES.ADMIN.MODERATION_REPORTS,
        },
        {
            label: "Strike Aktif",
            value: stats?.active_strikes ?? "-",
            subtitle: "Peringatan pelanggaran",
            icon: XCircle,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
            statusColor: "text-amber-600",
            href: ROUTES.ADMIN.MODERATION_ACTIONS,
        },
        {
            label: "Pengguna Disuspend",
            value: stats?.suspended_users ?? "-",
            subtitle: "Penangguhan sementara",
            icon: Users,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            statusColor: "text-primary",
            href: ROUTES.ADMIN.MODERATION_ACTIONS,
        },
        {
            label: "Pengguna Dibanned",
            value: stats?.banned_users ?? "-",
            subtitle: "Blokir permanen",
            icon: Ban,
            iconBg: "bg-red-500/10",
            iconColor: "text-red-600",
            statusColor: "text-red-600",
            href: ROUTES.ADMIN.USERS,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
            {statCards.map((card) => {
                const Icon = card.icon;
                return (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 sm:p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-900 transition-colors line-clamp-1">
                                {card.label}
                            </span>
                            <div className={`w-8 h-8 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {card.value}
                            </h3>
                            <p className={`text-[11px] font-medium mt-0.5 ${card.statusColor} truncate`}>
                                {card.subtitle}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
