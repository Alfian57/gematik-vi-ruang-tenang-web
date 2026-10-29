import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/utils";

export interface DashboardMascotHeroProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  image: string;
  imageAlt?: string;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
  dataTour?: string;
}

/**
 * Canonical theme-aware dashboard mascot hero component.
 * Reused across all roles (Mahasiswa, Admin, & Mitra).
 * Maskot memiliki overflow di atas kartu banner (-top-8) dengan jarak aman ke navbar
 * dan batas bawah rapi tanpa menutupi tombol atau kontrol di bawahnya.
 */
export function DashboardMascotHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "Maskot Ruang Tenang",
  action,
  badge,
  className,
  dataTour = "page-hero",
}: DashboardMascotHeroProps) {
  return (
    <section
      data-user-tour={dataTour}
      className={cn(
        "theme-accent-border-soft relative isolate mb-6 sm:mb-8 lg:mb-8 mt-5 sm:mt-6 lg:mt-7 flex min-h-48 sm:min-h-52 lg:min-h-56 items-center rounded-[2rem] border bg-[linear-gradient(120deg,var(--theme-accent-soft,#fff5f5),white_72%)] px-5 py-6 shadow-sm sm:px-8 sm:py-7 lg:px-10",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-theme-accent-light/60 blur-3xl" />
        <div className="theme-accent-border-soft absolute bottom-4 right-32 hidden h-20 w-20 rounded-full border lg:block" />
      </div>
      <div className="relative z-10 max-w-[70%] sm:max-w-[68%] lg:max-w-[65%]">
        <div className="flex flex-wrap items-center gap-2">
          {typeof eyebrow === "string" ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-theme-accent-dark">
              {eyebrow}
            </p>
          ) : (
            eyebrow
          )}
          {badge}
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {description}
        </p>
        {action ? <div className="mt-4 flex flex-wrap items-center gap-2.5">{action}</div> : null}
      </div>
      <Image
        src={image}
        alt={imageAlt}
        width={240}
        height={336}
        priority
        className="pointer-events-none absolute -top-5 sm:-top-7 lg:-top-7 right-2 sm:right-4 lg:right-6 z-0 h-36 sm:h-48 lg:h-64 max-h-[160px] sm:max-h-[215px] lg:max-h-[265px] w-auto max-w-[40%] object-contain object-top drop-shadow-xl"
        sizes="(max-width: 640px) 115px, (max-width: 1024px) 155px, 185px"
      />
    </section>
  );
}
