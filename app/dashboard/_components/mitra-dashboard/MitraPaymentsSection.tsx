import { Clock, ReceiptText } from "lucide-react";
import {
  formatCurrency,
  formatDate,
} from "../mitra-dashboard-utils";
import { MitraQuoteForm } from "./MitraQuoteForm";
import { PageSection } from "./PageSection";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraPaymentsSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraPaymentsSection({ viewModel }: MitraPaymentsSectionProps) {
  const payableAmount = viewModel.lastQuote?.final_amount ?? viewModel.subscription?.total_amount ?? 0;
  const billingPeriod = viewModel.subscription ? `${formatDate(viewModel.subscription.starts_at)} - ${formatDate(viewModel.subscription.ends_at)}` : "Belum ada periode aktif";
  const dueLabel = viewModel.lastQuote ? formatDate(viewModel.lastQuote.valid_until) : formatDate(viewModel.subscription?.ends_at);
  const hasOrganizations = viewModel.organizations.length > 0;

  return (
    <PageSection className="xl:grid-cols-5">
      <article data-mitra-tour="mitra-payment-summary" className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm xl:col-span-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <ReceiptText className="h-5 w-5 text-primary" />
          Ringkasan Tagihan
        </h2>
        {!hasOrganizations ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/95 p-16 text-center shadow-sm">
            <ReceiptText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500">Belum ada tagihan aktif</h4>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Tambahkan organisasi mitra terlebih dahulu untuk mulai membuat penawaran dan mengelola langganan B2B.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Nominal berjalan</p>
                <p className="mt-1 text-2xl font-bold text-gray-950 xs:text-3xl">{formatCurrency(payableAmount)}</p>
                <p className="mt-1 text-sm text-slate-700">{viewModel.lastQuote ? `Penawaran ${viewModel.lastQuote.quote_code}` : viewModel.subscriptionStateLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Jatuh tempo</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{dueLabel}</p>
                <p className="mt-1 text-sm text-gray-600">{viewModel.daysUntilRenewal === null ? "Belum aktif" : `${viewModel.daysUntilRenewal} hari tersisa`}</p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80">
              <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
                <span className="text-gray-500">Organisasi</span>
                <span className="font-medium text-gray-900 xs:text-right">{viewModel.selectedOrganizationName}</span>
              </div>
              <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
                <span className="text-gray-500">Periode</span>
                <span className="font-medium text-gray-900 xs:text-right">{billingPeriod}</span>
              </div>
              <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
                <span className="text-gray-500">Kuota</span>
                <span className="font-medium text-gray-900 xs:text-right">{viewModel.seatUsage?.used_seats ?? 0}/{viewModel.seatUsage?.contracted_seats ?? 0}</span>
              </div>
              <div className="grid grid-cols-1 gap-1 px-4 py-3 text-sm xs:grid-cols-2">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-900 xs:text-right">{viewModel.subscription?.status ?? "penawaran diperlukan"}</span>
              </div>
            </div>
          </>
        )}
      </article>

      <div className="xl:col-span-2"><MitraQuoteForm viewModel={viewModel} title="Penawaran Pembayaran" submitLabel="Buat Penawaran Pembayaran" /></div>

      <article data-mitra-tour="mitra-payment-flow" className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm xl:col-span-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Clock className="h-5 w-5 text-primary" />
          Alur Pembayaran
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ["1", "Buat penawaran", "Pilih paket, kuota, dan siklus tagihan sesuai kebutuhan organisasi."],
            ["2", "Konfirmasi tagihan", "Gunakan penawaran terbaru sebagai acuan nominal dan periode pembayaran."],
            ["3", "Aktivasi kuota", "Setelah pembayaran dikonfirmasi, kuota premium siap dialokasikan ke anggota."],
          ].map(([step, title, description]) => (
            <div key={step} className="rounded-2xl border border-slate-200/80 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{step}</div>
              <p className="mt-3 font-semibold text-gray-900">{title}</p>
              <p className="mt-1 text-sm leading-5 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </article>
    </PageSection>
  );
}
