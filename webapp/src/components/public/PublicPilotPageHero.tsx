import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  preview?: ReactNode;
};

/**
 * Kompakter Seitenkopf im Ascent-Stil (ohne Vollbild-Foto) — z. B. /buchen.
 */
export function PublicPilotPageHero({ title, description, preview }: Props) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--ascent-primary)]/14 via-white to-[var(--ascent-container-low)] shadow-[0_24px_48px_-20px_rgba(0,88,188,0.18)] sm:mb-8 sm:rounded-3xl">
      <div className="public-safe-x flex flex-col gap-6 px-4 py-7 sm:flex-row sm:items-center sm:gap-10 sm:px-6 sm:py-9 md:px-8">
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
