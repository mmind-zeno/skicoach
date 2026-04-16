import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductPreviewBooking } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";

type Props = {
  preview?: ReactNode;
  showBookingCta: boolean;
  ctaPrimaryClass: string;
  ctaSecondaryClass: string;
};

/** Alpine-Hero im Stitch-Pilot-Stil (ohne externe Google-CDNs). */
export function LandingPilotHero({
  preview = <ProductPreviewBooking />,
  showBookingCta,
  ctaPrimaryClass,
  ctaSecondaryClass,
}: Props) {
  return (
    <section className="relative -mx-4 mb-8 min-h-[min(88vh,52rem)] overflow-hidden rounded-2xl sm:-mx-0 sm:rounded-3xl md:mb-10">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1551524164-687a55dd1126?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/45 to-white/10"
          aria-hidden
        />
      </div>
      <div className="relative z-10 flex min-h-[min(88vh,52rem)] flex-col justify-end gap-8 px-4 pb-10 pt-28 sm:px-8 sm:pb-12 md:flex-row md:items-end md:justify-between md:gap-10 md:px-10 md:pb-14 md:pt-32">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ascent-primary)]">
            {brand.marketingTagline}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[var(--ascent-on-surface)] sm:text-4xl md:text-5xl">
            {brand.siteName}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ascent-on-surface-variant)] sm:text-lg">
            {brand.homeLead}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {showBookingCta ? (
              <Link href="/buchen" className={ctaPrimaryClass}>
                {brand.labels.requestServiceCta}
              </Link>
            ) : null}
            <Link href="/kalender" className={ctaSecondaryClass}>
              {brand.labels.teamLoginHome}
            </Link>
          </div>
        </div>
        <div className="w-full shrink-0 md:max-w-sm md:self-end">
          <div className="rounded-2xl bg-white/80 p-3 shadow-[0_24px_48px_-12px_rgba(25,28,30,0.18)] backdrop-blur-md backdrop-saturate-150">
            {preview}
          </div>
        </div>
      </div>
    </section>
  );
}
