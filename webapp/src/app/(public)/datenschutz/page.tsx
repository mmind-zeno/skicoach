export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold text-sk-ink">Datenschutz</h1>
      <p className="mt-4 text-sm leading-relaxed text-sk-ink/80">
        Diese Seite ist ein Platzhalter. Hier binden Sie die Datenschutzerklärung
        für skicoach.li ein (Verantwortliche, Zwecke, Hosting, Kontaktformular /
        Buchungsanfragen, Cookies, Ihre Rechte). Bei Fragen:{" "}
        <a className="text-sk-brand underline" href="mailto:info@skicoach.li">
          info@skicoach.li
        </a>
        .
      </p>
      <p className="mt-4 text-sm leading-relaxed text-sk-ink/80">
        Hinweis: Hosting und/oder Support kann ueber <a className="text-sk-brand underline" href="https://mmind.ai" target="_blank" rel="noreferrer">mmind.ai</a> erfolgen.
      </p>
    </div>
  );
}
