import Image from "next/image";
import { brand } from "@/config/brand";
import { stitchImages } from "@/config/stitch-images";
import { BookingWizard } from "@/features/booking-public/BookingWizard";

export default function BuchenPage() {
  return (
    <div className="min-h-screen bg-sk-surface">
      <header className="border-b border-sk-outline/20 bg-gradient-to-br from-sk-highlight/90 to-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:gap-10 md:px-6 md:py-10">
          <div className="order-2 min-w-0 flex-1 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sk-cta">
              {brand.siteName}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-sk-ink md:text-3xl">
              {brand.labels.requestServiceCta}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-sk-ink/75">{brand.homeLead}</p>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-md shrink-0 overflow-hidden rounded-2xl border border-sk-outline/25 bg-white shadow-sk-ambient md:order-2 md:max-w-sm">
            <div className="relative aspect-[4/3] w-full bg-sk-container-low">
              <Image
                src={stitchImages.buchungAnfrage}
                alt="Vorschau Buchungsformular"
                fill
                sizes="(min-width: 768px) 20rem, 100vw"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </header>
      <BookingWizard />
    </div>
  );
}
