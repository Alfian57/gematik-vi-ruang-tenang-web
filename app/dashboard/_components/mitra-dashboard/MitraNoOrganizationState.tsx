import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraNoOrganizationStateProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraNoOrganizationState({ viewModel }: MitraNoOrganizationStateProps) {
  if (viewModel.hasOrganizations) return null;

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-16 text-center shadow-sm">
      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-500">Belum ada organisasi mitra</h3>
      <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
        Buat organisasi pertama untuk membuka invite anggota, langganan, analitik, dan pembayaran.
      </p>
      <Button
        type="button"
        onClick={() => viewModel.setShowCreateForm(true)}
        className="gradient-primary mt-6 rounded-xl text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Buat Organisasi
      </Button>
    </article>
  );
}
