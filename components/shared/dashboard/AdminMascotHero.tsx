import { DashboardMascotHero, type DashboardMascotHeroProps } from "./DashboardMascotHero";
import { cn } from "@/utils";

export type AdminMascotHeroProps = DashboardMascotHeroProps;

/**
 * Admin hero wrapper reusing the canonical DashboardMascotHero component
 * with calibrated compact margin for full-width admin stat cards & toolbars.
 */
export function AdminMascotHero({ className, ...props }: AdminMascotHeroProps) {
  return <DashboardMascotHero className={cn("mb-6 sm:mb-8", className)} {...props} />;
}
