import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/utils";

export interface DashboardMascotEmptyProps {
  title: string;
  description: string;
  image?: string;
  action?: ReactNode;
  className?: string;
}

export function DashboardMascotEmpty({
  title,
  description,
  image,
  action,
  className,
}: DashboardMascotEmptyProps) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 px-6 py-14 text-center shadow-sm sm:py-16",
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={120}
          height={150}
          className="mb-3 h-28 w-auto object-contain"
        />
      ) : null}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
