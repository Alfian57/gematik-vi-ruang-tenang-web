"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  MessageSquareText,
  ShieldCheck,
  Check,
  Info,
  ShieldAlert,
  Hash,
} from "lucide-react";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";
import type { TriggerWarningCategory } from "@/types/moderation";
import { cn } from "@/utils";

const TRIGGER_WARNING_OPTIONS: { value: TriggerWarningCategory; label: string; desc: string }[] = [
  { value: "self_harm", label: "Melukai Diri", desc: "Perilaku melukai diri tanpa niat bunuh diri" },
  { value: "suicide", label: "Bunuh Diri", desc: "Ideasi, niat, atau riwayat terkait bunuh diri" },
  { value: "depression", label: "Depresi Berat", desc: "Kisah keputusasaan mendalam atau fase kelam" },
  { value: "anxiety", label: "Kecemasan Akut", desc: "Episode panik atau kecemasan yang melumpuhkan" },
  { value: "abuse", label: "Pelecehan / Kekerasan", desc: "Pelecehan emosional, fisik, atau verbal" },
  { value: "violence", label: "Kekerasan Fisik", desc: "Tindakan agresif fisik atau bahaya terancam" },
  { value: "eating_disorder", label: "Gangguan Makan", desc: "Pola makan abnormal, anoreksia, atau bulimia" },
  { value: "substance_abuse", label: "Penyalahgunaan Zat", desc: "Ketergantungan alkohol atau obat-obatan" },
  { value: "trauma", label: "Trauma / PTSD", desc: "Pengalaman masa lalu traumatis dan kilas balik" },
  { value: "death", label: "Kematian / Berduka", desc: "Kehilangan orang terkasih atau peristiwa fatal" },
  { value: "other", label: "Sensitif Lainnya", desc: "Topik emosional yang memicu ketidaknyamanan" },
];

export default function TriggerWarningsPage() {
  const { token } = useAuthStore();

  const [contentType, setContentType] = useState<"article" | "forum">("article");
  const [contentId, setContentId] = useState("");
  const [selected, setSelected] = useState<TriggerWarningCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (value: TriggerWarningCategory) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!token) return;
    const id = Number(contentId);
    if (!Number.isFinite(id) || id < 1) {
      toast.error("ID konten tidak valid. Harap masukkan angka ID konten yang benar.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Pilih minimal satu kategori trigger warning.");
      return;
    }
    setIsSaving(true);
    try {
      await moderationService.addTriggerWarnings(token, {
        content_type: contentType,
        content_id: id,
        trigger_warnings: selected,
      });
      toast.success("Trigger warning berhasil diterapkan pada konten.");
      setContentId("");
      setSelected([]);
    } catch (error) {
      console.error("Failed to add trigger warnings:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan trigger warning.");
    } finally {
      setIsSaving(false);
    }
  };

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
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Peringatan Sensitif</span>
          </div>
        }
        title="Kelola Trigger Warning"
        description="Tambahkan penanda konten sensitif pada artikel atau diskusi forum agar pembaca siap secara mental sebelum membaca."
        image="/images/landing/mascot/listen.webp"
        imageAlt="Maskot RuNa memperhatikan keselamatan"
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Form Tambah Peringatan Konten</h3>
                <p className="text-xs text-slate-500">Tentukan konten sasaran dan aktifkan label peringatan yang sesuai</p>
              </div>
            </div>

            {/* Content Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Konten</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setContentType("article")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 text-sm font-semibold transition-all",
                    contentType === "article"
                      ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                  )}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  Artikel Edukasi
                </button>
                <button
                  type="button"
                  onClick={() => setContentType("forum")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 text-sm font-semibold transition-all",
                    contentType === "forum"
                      ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                  )}
                >
                  <MessageSquareText className="h-4 w-4 shrink-0" />
                  Forum Diskusi
                </button>
              </div>
            </div>

            {/* Content ID Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ID Konten ({contentType === "article" ? "ID Artikel" : "ID Topik Forum"})
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min="1"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  placeholder={contentType === "article" ? "Contoh: 14" : "Contoh: 8"}
                  className="h-11 pl-10 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary/20"
                />
              </div>
              <p className="text-xs text-slate-400">ID numerik dapat dilihat dari URL konten atau daftar antrean moderasi.</p>
            </div>

            {/* Warning Categories */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pilih Kategori Sensitif
                </label>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {selected.length} dipilih
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TRIGGER_WARNING_OPTIONS.map((opt) => {
                  const isChecked = selected.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        "group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all",
                        isChecked
                          ? "border-amber-400/90 bg-amber-50/70 shadow-xs"
                          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                          isChecked
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        )}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1 select-none">
                        <div className={cn("text-sm font-semibold leading-tight", isChecked ? "text-amber-950" : "text-slate-800")}>
                          {opt.label}
                        </div>
                        <p className={cn("text-xs leading-snug mt-0.5", isChecked ? "text-amber-700/90" : "text-slate-400")}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                onClick={handleSubmit}
                disabled={isSaving || !contentId || selected.length === 0}
                className="gradient-primary h-11 w-full rounded-2xl text-white font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition disabled:opacity-50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {isSaving ? "Menyimpan Trigger Warning..." : "Terapkan Trigger Warning ke Konten"}
              </Button>
            </div>
          </div>
        </div>

        {/* Guidelines / Info Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              Panduan Moderasi
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Perlindungan Emosional
                </h4>
                <p>
                  Trigger Warning bertujuan memberikan pembaca kendali sebelum membaca konten yang berpotensi memicu trauma emosional atau serangan kecemasan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Pemberian Proporsional
                </h4>
                <p>
                  Berikan label hanya jika konten secara eksplisit membahas topik di atas. Jangan menerapkan label berlebihan pada konten diskusi umum yang aman.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70 text-rose-900 space-y-1">
                <h4 className="font-semibold text-rose-950 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  Eskalasi Krisis
                </h4>
                <p className="text-rose-800">
                  Jika isi konten mengindikasikan niat bunuh diri yang sedang berlangsung, segera eskalasi laporan ke tim medis darurat melalui Antrean Krisis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-800">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Banner peringatan akan otomatis ditampilkan di antarmuka pengguna sebelum artikel atau topik forum dibuka sepenuhnya.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
