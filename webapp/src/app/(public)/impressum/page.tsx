import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: brand.labels.navImpressum,
  description: brand.labels.imprintMusterDisclaimer.slice(0, 158),
  alternates: { canonical: "/impressum" },
};

function stripUnresolvedPlaceholders(text: string): string {
  return text.replace(/\{[a-zA-Z][a-zA-Z0-9]*\}/g, "—");
}

function expandImprintBody(template: string) {
  return stripUnresolvedPlaceholders(
    template
    .replace(/\{siteName\}/g, brand.siteName)
    .replace(/\{siteDomain\}/g, brand.siteDomain)
    .replace(/\{supportEmail\}/g, brand.supportEmail)
    .replace(/\{postalAddress\}/g, brand.legalPostalAddress)
  );
}

export default function ImpressumPage() {
  const L = brand.labels;
  const sections: { title: string; body: string }[] = [
    { title: L.imprintSection1Title, body: expandImprintBody(L.imprintSection1BodyTemplate) },
    { title: L.imprintSection2Title, body: expandImprintBody(L.imprintSection2BodyTemplate) },
  ];

  return (
    <div className="public-safe-x mx-auto max-w-2xl px-0 py-8 sm:py-10">
      <h1 className="text-[1.35rem] font-semibold leading-snug text-sk-ink sm:text-xl">
        {L.navImpressum}
      </h1>
      <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-3 text-sm leading-relaxed text-amber-950/90">
        {L.legalTestProjectNotice}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-sk-ink/70">
        {L.imprintMusterDisclaimer}
      </p>
      <div className="mt-8 space-y-6 text-base leading-relaxed text-sk-ink/85 sm:text-sm">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-semibold text-sk-ink">{s.title}</h2>
            <p className="mt-2 whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm leading-relaxed text-sk-ink/80">
        <a className="text-sk-brand underline" href={`mailto:${brand.supportEmail}`}>
          {brand.supportEmail}
        </a>
      </p>
    </div>
  );
}
