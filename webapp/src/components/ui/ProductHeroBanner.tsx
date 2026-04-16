import type { ReactNode } from "react";
import { brand } from "@/config/brand";

/**
 * Editorial-Header wie im Produkt-Design; rechts eine scharfe, vektorbasierte
 * Miniatur der echten UI (keine Raster-Mockups).
 */
export function ProductHeroBanner({
  title,
  description,
  eyebrow = brand.siteName,
  preview,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  preview: ReactNode;
}) {
  return (
    <header className="mb-6 rounded-2xl border border-sk-outline/20 bg-gradient-to-br from-sk-highlight/90 to-white py-5 sm:mb-8 sm:py-6 md:py-8">
      <div className="public-safe-x mx-auto flex max-w-4xl flex-col gap-5 px-0 sm:gap-6 md:flex-row md:items-center md:gap-10 md:px-6">
        <div className="order-2 min-w-0 flex-1 md:order-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sk-cta">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-[1.35rem] font-semibold leading-snug tracking-tight text-sk-ink sm:text-2xl md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-sk-ink/75">
              {description}
            </p>
          ) : null}
        </div>
        <div className="order-1 w-full shrink-0 md:order-2 md:w-auto md:max-w-[min(100%,22rem)]">
          <div className="mx-auto w-full max-w-[20rem] sm:max-w-sm md:mx-0 md:ml-auto">
            {preview}
          </div>
        </div>
      </div>
    </header>
  );
}
