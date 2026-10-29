import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";
import type { MitraDashboardSection } from "../mitra-dashboard-utils";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

const MITRA_MASCOT_MAP: Record<MitraDashboardSection, { src: string; alt: string }> = {
  overview: {
    src: "/images/landing/mascot/welcome.webp",
    alt: "Maskot RuNa menyambut Pengelola Mitra",
  },
  organizations: {
    src: "/images/landing/mascot/community.webp",
    alt: "Maskot RuNa mengelola organisasi dan anggota",
  },
  subscription: {
    src: "/images/landing/mascot/key.webp",
    alt: "Maskot RuNa dengan kunci paket B2B",
  },
  insights: {
    src: "/images/landing/mascot/mood.webp",
    alt: "Maskot RuNa menganalisis insight kesehatan",
  },
  payments: {
    src: "/images/landing/mascot/secure.webp",
    alt: "Maskot RuNa menjaga keamanan pembayaran",
  },
  settings: {
    src: "/images/landing/mascot/companion.webp",
    alt: "Maskot RuNa mendampingi pengaturan mitra",
  },
};

interface MitraDashboardHeaderProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraDashboardHeader({ viewModel }: MitraDashboardHeaderProps) {
  const PageIcon = viewModel.pageMeta.icon;
  const currentSection = (viewModel.currentSection || "overview") as MitraDashboardSection;
  const mascot = MITRA_MASCOT_MAP[currentSection] || MITRA_MASCOT_MAP.overview;

  return (
    <div data-mitra-tour="mitra-header" className="flex flex-col gap-6">
      {/* Canonical Reusable Mascot Hero (identical to student reference) */}
      <DashboardMascotHero
        dataTour="mitra-hero"
        className="mb-6 sm:mb-8"
        eyebrow={
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <PageIcon className="h-4 w-4" />
            {viewModel.pageMeta.eyebrow}
          </p>
        }
        title={viewModel.pageMeta.title}
        description={viewModel.pageMeta.description}
        image={mascot.src}
        imageAlt={mascot.alt}
      />

      {/* Action controls toolbar — clean bar without wrapper card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
          <Select
            value={viewModel.selectedOrganizationId ? String(viewModel.selectedOrganizationId) : ""}
            onValueChange={(value) => viewModel.setSelectedOrganizationId(Number(value))}
          >
            <SelectTrigger className="w-full rounded-xl border-slate-200/90 bg-white text-slate-800 shadow-xs">
              <SelectValue placeholder="Pilih organisasi" />
            </SelectTrigger>
            <SelectContent>
              {viewModel.organizations.map((item) => (
                <SelectItem key={item.organization.id} value={String(item.organization.id)}>
                  {item.organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => viewModel.setShowCreateForm((value) => !value)}
            className="gradient-primary rounded-xl text-white shadow-xs"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Organisasi
          </Button>
        </div>
      </div>

      {viewModel.showCreateForm && (
        <form
          onSubmit={viewModel.handleCreateOrganization}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-primary/15 bg-white/95 p-4 shadow-sm md:grid-cols-2"
        >
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="organization-name">Nama Organisasi</Label>
            <Input
              id="organization-name"
              placeholder="Contoh: Kampus Nusantara Sehat"
              value={viewModel.organizationForm.name}
              onChange={(event) =>
                viewModel.setOrganizationForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organization-email">Email Kontak</Label>
            <Input
              id="organization-email"
              type="email"
              placeholder="wellbeing@kampus.ac.id"
              value={viewModel.organizationForm.contact_email}
              onChange={(event) =>
                viewModel.setOrganizationForm((prev) => ({ ...prev, contact_email: event.target.value }))
              }
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organization-code">Kode</Label>
            <Input
              id="organization-code"
              placeholder="kampus-nusantara"
              value={viewModel.organizationForm.code}
              onChange={(event) =>
                viewModel.setOrganizationForm((prev) => ({ ...prev, code: event.target.value }))
              }
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="organization-type">Jenis Organisasi</Label>
            <Input
              id="organization-type"
              placeholder="education, corporate, komunitas, atau healthcare"
              value={viewModel.organizationForm.business_type}
              onChange={(event) =>
                viewModel.setOrganizationForm((prev) => ({ ...prev, business_type: event.target.value }))
              }
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-2 xs:flex-row xs:justify-end md:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => viewModel.setShowCreateForm(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={viewModel.isSubmitting} className="gradient-primary rounded-xl text-white">
              {viewModel.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Organisasi
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
