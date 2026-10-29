import Link from "next/link";
import { Activity, AlertCircle, ArrowRight } from "lucide-react";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";
import { AuditLogList } from "./AuditLogList";
import { MitraKpiCards } from "./MitraKpiCards";
import { PageSection } from "./PageSection";

interface MitraOverviewSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraOverviewSection({ viewModel }: MitraOverviewSectionProps) {
  return (
    <>
      <section className="rounded-2xl border border-primary/15 bg-white/95 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pusat Kendali Mitra</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">{viewModel.selectedOrganizationName}</h2>
            <p className="mt-1 text-sm text-gray-600">Pilih alur kerja sesuai kebutuhan operasional hari ini.</p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs font-medium text-primary xs:grid-cols-2 md:flex md:flex-wrap">
            <span className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-xs">Kuota {viewModel.seatUsagePercent}%</span>
            <span className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-xs">Persetujuan {viewModel.pendingMembers.length}</span>
            <span className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-xs">Tagihan {viewModel.hasActiveSubscription ? "aktif" : "perlu disiapkan"}</span>
          </div>
        </div>
      </section>

      <MitraKpiCards viewModel={viewModel} />

      <div data-mitra-tour="mitra-workflow-shortcuts">
        <PageSection className="md:grid-cols-2 xl:grid-cols-4">
          {viewModel.workflowLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-950">{item.title}</h3>
              <p className="mt-1 min-h-10 text-sm leading-5 text-gray-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2">
                {item.action}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </PageSection>
      </div>

      <PageSection className="xl:grid-cols-3">
        <article data-mitra-tour="mitra-recent-activity" className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm xl:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Activity className="h-5 w-5 text-primary" />
            Aktivitas Terbaru
          </h2>
          <AuditLogList
            logs={viewModel.auditLogs}
            limit={5}
            emptyTitle="Belum ada aktivitas terbaru"
            emptyDescription="Undangan, persetujuan anggota, perubahan kuota, dan pengingat organisasi akan tampil di sini."
          />
        </article>

        <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Fokus Berikutnya
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
              <p className="font-semibold text-red-900">Persetujuan anggota</p>
              <p className="mt-1 text-red-800">{viewModel.pendingMembers.length} anggota menunggu keputusan.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="font-semibold text-gray-900">Periode tagihan</p>
              <p className="mt-1 text-gray-600">{viewModel.daysUntilRenewal === null ? "Belum ada periode aktif." : `${viewModel.daysUntilRenewal} hari sampai akhir periode.`}</p>
            </div>
          </div>
        </article>
      </PageSection>
    </>
  );
}
