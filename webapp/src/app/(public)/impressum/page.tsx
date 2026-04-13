import { brand } from "@/config/brand";

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
    { title: L.imprintSection3Title, body: expandImprintBody(L.imprintSection3BodyTemplate) },
    { title: L.imprintSection4Title, body: expandImprintBody(L.imprintSection4BodyTemplate) },
    { title: L.imprintSection5Title, body: expandImprintBody(L.imprintSection5BodyTemplate) },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold text-sk-ink">{L.navImpressum}</h1>
      <p className="mt-4 text-sm leading-relaxed text-sk-ink/70">
        {L.imprintMusterDisclaimer}
      </p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-sk-ink/85">
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
