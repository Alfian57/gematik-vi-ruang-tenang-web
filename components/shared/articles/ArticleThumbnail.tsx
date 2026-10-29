import Image from "next/image";
import { cn } from "@/utils";
import { getUploadUrl } from "@/services/http/upload-url";

type ArticleThumbnailProps = {
  src?: string | null;
  alt: string;
  sizes?: string;
  imageClassName?: string;
};

/** Shared article artwork so missing covers look consistent across every article surface. */
export function ArticleThumbnail({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  imageClassName,
}: ArticleThumbnailProps) {
  const normalizedSrc = src?.trim();

  if (normalizedSrc) {
    const resolvedSrc = normalizedSrc.startsWith("http") || normalizedSrc.startsWith("data:")
      ? normalizedSrc
      : getUploadUrl(normalizedSrc);

    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(145deg,var(--theme-accent-soft),var(--theme-accent-light))]" aria-hidden="true">
      <div className="absolute -right-4 -top-5 h-16 w-16 rounded-full bg-white/50 blur-lg" />
      <Image
        src="/images/dashboard/mascot/article-placeholder.webp"
        alt=""
        fill
        sizes={sizes}
        className={cn("object-contain object-bottom p-1", imageClassName)}
      />
    </div>
  );
}
