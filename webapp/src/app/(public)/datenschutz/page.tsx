import { brand } from "@/config/brand";

function stripUnresolvedPlaceholders(text: string): string {
  return text.replace(/\{[a-zA-Z][a-zA-Z0-9]*\}/g, "—");
}

function expandPrivacyBody(template: string) {
  const L = brand.labels;
  return stripUnresolvedPlaceholders(
    template
    .replace(/\{siteName\}/g, brand.siteName)
    .replace(/\{siteDomain\}/g, brand.siteDomain)
    .replace(/\{supportEmail\}/g, brand.supportEmail)
    .replace(/\{issuerLocation\}/g, brand.issuerLocation)
    .replace(/\{postalAddress\}/g, brand.legalPostalAddress)
    .replace(/\{bookingRequestPlural\}/g, L.bookingRequestPlural)
    .replace(/\{bookingPlural\}/g, L.bookingPlural)
    .replace(/\{appointmentPlural\}/g, L.appointmentPlural)
    .replace(/\{clientPlural\}/g, L.clientPlural)
    .replace(/\{invoicePlural\}/g, L.invoicePlural)
  );
}

export default function DatenschutzPage() {
  const L = brand.labels;
  const sections: { title: string; body: string }[] = [
    { title: L.privacySection1Title, body: expandPrivacyBody(L.privacySection1BodyTemplate) },
    { title: L.privacySection2Title, body: expandPrivacyBody(L.privacySection2BodyTemplate) },
    { title: L.privacySection3Title, body: expandPrivacyBody(L.privacySection3BodyTemplate) },
    { title: L.privacySection4Title, body: expandPrivacyBody(L.privacySection4BodyTemplate) },
    { title: L.privacySection5Title, body: expandPrivacyBody(L.privacySection5BodyTemplate) },
    { title: L.privacySection6Title, body: expandPrivacyBody(L.privacySection6BodyTemplate) },
    { title: L.privacySection7Title, body: expandPrivacyBody(L.privacySection7BodyTemplate) },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold text-sk-ink">{L.navPrivacy}</h1>
      <p className="mt-4 text-sm leading-relaxed text-sk-ink/70">
        {L.privacyMusterDisclaimer}
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
        {L.privacyContactPromptTemplate}{" "}
        <a className="text-sk-brand underline" href={`mailto:${brand.supportEmail}`}>
          {brand.supportEmail}
        </a>
      </p>
      <p className="mt-6 text-sm leading-relaxed text-sk-ink/70">
        {L.privacyHostingNoteBeforeLink}
        <a
          className="text-sk-brand underline"
          href={L.privacyHostingNoteLinkUrl}
          target="_blank"
          rel="noreferrer"
        >
          {L.privacyHostingNoteLinkText}
        </a>
        {L.privacyHostingNoteAfterLink}
      </p>
    </div>
  );
}
