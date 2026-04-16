import Image from "next/image";
import type { ReactNode } from "react";
import {
  ASCENT_BOOKING_HERO_IMAGE,
  ASCENT_GUEST_PORTAL_HERO_IMAGE,
} from "@/lib/public-ascent-assets";

type Props = {
  title: string;
  description?: string;
  preview?: ReactNode;
  /**
   * Atmosphäre laut Stitch-Brief: Buchung (dezent alpin) / Gastportal (weich, Tiefe).
   * `none` = nur Verlauf wie zuvor.
   */
  atmosphere?: "none" | "booking" | "guest-portal";
};

/**
 * Kompakter Seitenkopf im Ascent-Stil — optional mit Foto-Unterlage (z. B. /buchen).
 */
export function PublicPilotPageHero({
  title,
  description,
  preview,
  atmosphere = "none",
}: Props) {
  const imageSrc =
    atmosphere === "booking"
      ? ASCENT_BOOKING_HERO_IMAGE
      : atmosphere === "guest-portal"
        ? ASCENT_GUEST_PORTAL_HERO_IMAGE
        : null;

  const imageTreatment =
    atmosphere === "guest-portal"
      ? "scale-105 object-[center_42%] blur-[2px]"
      : "object-[center_38%]";

  const scrimClass =
    atmosphere === "booking"
      ? "bg-gradient-to-br from-white/93 via-white/88 to-[var(--ascent-container-low)]/92"
      : atmosphere === "guest-portal"
        ? "bg-gradient-to-br from-white/90 via-[var(--ascent-surface)]/88 to-[var(--ascent-primary)]/10"
        : null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--ascent-primary)]/14 via-white to-[var(--ascent-container-low)] shadow-[0_24px_48px_-20px_rgba(0,88,188,0.18)] sm:mb-8 sm:rounded-3xl">
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt=""
            fill
            className={`object-cover ${imageTreatment}`}
            sizes="(max-width: 768px) 100vw, min(896px, 92vw)"
            priority={atmosphere !== "none"}
          />
          <div
            className={`pointer-events-none absolute inset-0 ${scrimClass}`}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ascent-surface)]/25 to-transparent"
            aria-hidden
          />
        </>
      ) : null}
      <div className="relative z-[1] public-safe-x flex flex-col gap-6 px-4 py-7 sm:flex-row sm:items-center sm:gap-10 sm:px-6 sm:py-9 md:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ascent-on-surface)] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--ascent-on-surface-variant)]">
              {description}
            </p>
          ) : null}
        </div>
        {preview ? (
          <div className="mx-auto w-full max-w-[min(100%,20rem)] shrink-0 sm:mx-0">
            {preview}
          </div>
        ) : null}
      </div>
    </div>
  );
}
