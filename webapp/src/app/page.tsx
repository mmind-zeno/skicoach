import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <main className="flex items-center px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-sk-ink/10 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-sk-brand">skicoach</h1>
          <p className="mt-3 max-w-xl text-sm text-sk-ink/70">
            Buchungsportal und Team-Workspace der Skischule. Kursanfragen laufen ueber
            das oeffentliche Portal, interne Planung ueber Kalender und Admin-Bereich.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href="/buchen"
              className="rounded-lg bg-[#1B4F8A] px-4 py-2 text-white hover:bg-[#163d6e]"
            >
              Kurs anfragen
            </Link>
            <Link
              href="/kalender"
              className="rounded-lg border border-sk-brand px-4 py-2 text-sk-brand hover:bg-[#E8F0FA]"
            >
              Team-Login
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-sk-ink/10 py-6 text-center text-xs text-sk-ink/50">
        <a href="mailto:info@skicoach.li" className="underline hover:text-sk-brand">
          Kontakt
        </a>
        {" · "}
        <Link href="/datenschutz" className="underline hover:text-sk-brand">
          Datenschutz
        </Link>
        <div className="mt-2 text-[10px] text-sk-ink/60">
          Datenschutz-Hinweis: Hosting und/oder Support kann ueber mmind.ai erfolgen.
        </div>
      </footer>
    </div>
  );
}
