/**
 * Klassen für öffentliche Flächen im Landing-Pilot (CSS-Variablen `.landing-pilot`).
 * Classic = bestehende sk-*-Utilities.
 */

export function getBookingWizardUi(pilot: boolean) {
  if (pilot) {
    return {
      card: "rounded-2xl bg-white/90 p-4 shadow-[0_24px_40px_-12px_rgba(25,28,30,0.08)] backdrop-blur-sm sm:p-5 md:p-8",
      heading:
        "text-xl font-semibold tracking-tight text-[var(--ascent-on-surface)] md:text-2xl",
      stepperOn: "bg-[var(--ascent-primary)]",
      stepperOff: "bg-[var(--ascent-on-surface)]/15",
      courseOn:
        "border-2 border-[var(--ascent-primary)] bg-[var(--ascent-primary)]/10",
      courseOff:
        "border-2 border-transparent bg-white shadow-md hover:border-[var(--ascent-primary)]/30",
      courseName: "font-medium text-[var(--ascent-primary)]",
      courseMeta: "mt-1 text-sm text-[var(--ascent-on-surface-variant)]",
      btnPrimary:
        "w-full min-h-[48px] rounded-xl bg-gradient-to-br from-[var(--ascent-primary)] to-[var(--ascent-primary-container)] px-4 py-3 text-base font-bold text-white shadow-[0_12px_28px_-8px_rgba(0,88,188,0.35)] transition active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:py-2 sm:text-sm",
      btnSecondary:
        "w-full min-h-[48px] rounded-xl border border-[var(--ascent-primary)]/25 bg-white px-4 py-3 text-base font-semibold text-[var(--ascent-primary)] shadow-sm transition hover:bg-[var(--ascent-container-low)] active:scale-[0.99] sm:w-auto sm:py-2 sm:text-sm",
      calToolbar:
        "mt-4 flex items-center justify-between gap-2 rounded-xl bg-[var(--ascent-container-low)] px-1 py-1",
      calNavBtn:
        "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-lg font-medium text-[var(--ascent-primary)] transition hover:bg-white/80",
      calMonthTitle:
        "min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize text-[var(--ascent-on-surface)] sm:text-base",
      weekday:
        "py-1 font-medium text-[var(--ascent-on-surface-variant)]/80",
      legend:
        "mt-4 flex flex-wrap gap-3 text-xs text-[var(--ascent-on-surface-variant)]",
      slotDisabled:
        "bg-[var(--ascent-on-surface)]/10 text-[var(--ascent-on-surface)]/40 line-through",
      slotOn: "bg-[var(--ascent-primary)] text-white",
      slotOff: "bg-[#EAF3DE] text-[var(--ascent-on-surface)]",
      slotsSectionLabel:
        "text-sm font-medium text-[var(--ascent-on-surface)]",
      meta: "mt-2 text-xs text-[var(--ascent-on-surface-variant)]/90",
      labelMuted:
        "text-sm font-medium text-[var(--ascent-on-surface-variant)]",
      field:
        "min-h-[48px] w-full rounded-xl border-0 bg-[var(--ascent-container-low)] px-3 py-2.5 text-[var(--ascent-on-surface)] text-base shadow-[inset_0_0_0_1px_rgba(0,88,188,0.12)] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ascent-primary)]/35 sm:text-sm",
      fieldArea:
        "min-h-[6rem] w-full resize-y rounded-xl border-0 bg-[var(--ascent-container-low)] px-3 py-2.5 text-[var(--ascent-on-surface)] text-base shadow-[inset_0_0_0_1px_rgba(0,88,188,0.12)] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ascent-primary)]/35 sm:text-sm",
      niveauOn: "bg-[var(--ascent-primary)] text-white",
      niveauOff:
        "border border-[var(--ascent-primary)]/20 bg-[var(--ascent-surface)] text-[var(--ascent-on-surface)]",
      turnstileBox:
        "mt-3 rounded-xl bg-white/85 p-3 shadow-[inset_0_0_0_1px_rgba(0,88,188,0.08)]",
      turnstileHint: "mb-2 text-xs text-[var(--ascent-on-surface-variant)]",
      summaryBox:
        "rounded-xl bg-[var(--ascent-container-low)] p-3 text-xs text-[var(--ascent-on-surface-variant)]",
      summaryMuted: "mt-2 text-[var(--ascent-on-surface-variant)]/80",
      thanksTitle:
        "mt-4 text-xl font-semibold text-[var(--ascent-on-surface)]",
      thanksBody:
        "mx-auto mt-2 max-w-md text-base leading-relaxed text-[var(--ascent-on-surface-variant)]",
      thanksEmail: "font-medium text-[var(--ascent-primary)]",
      refBox:
        "mt-4 inline-block rounded-xl bg-white/90 px-3 py-1.5 font-mono text-xs text-[var(--ascent-on-surface-variant)] shadow-sm",
      resetBtn:
        "mx-auto mt-8 flex w-full max-w-md min-h-[48px] items-center justify-center rounded-xl border-2 border-[var(--ascent-primary)]/35 bg-white px-5 py-3 text-base font-semibold text-[var(--ascent-primary)] shadow-sm transition hover:bg-[var(--ascent-container-low)] active:scale-[0.99] sm:text-sm",
      colSelected: "#0058bc",
      calDayText: "#191c1e",
    };
  }
  return {
    card: "sk-surface-card p-4 sm:p-5 md:p-8",
    heading: "text-xl font-semibold tracking-tight text-sk-ink md:text-2xl",
    stepperOn: "bg-sk-cta",
    stepperOff: "bg-sk-ink/15",
    courseOn: "border-sk-cta bg-sk-highlight",
    courseOff: "border-transparent bg-white shadow hover:border-sk-brand/40",
    courseName: "font-medium text-sk-cta",
    courseMeta: "mt-1 text-sm text-sk-ink/70",
    btnPrimary:
      "w-full min-h-[48px] rounded-xl bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:py-2 sm:text-sm",
    btnSecondary:
      "w-full min-h-[48px] rounded-xl border border-sk-outline/35 bg-white px-4 py-3 text-base font-semibold text-sk-brand shadow-sm transition hover:bg-sk-highlight active:scale-[0.99] sm:w-auto sm:py-2 sm:text-sm",
    calToolbar:
      "mt-4 flex items-center justify-between gap-2 rounded-xl bg-sk-highlight/35 px-1 py-1",
    calNavBtn:
      "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-lg font-medium text-sk-brand transition hover:bg-white/80",
    calMonthTitle:
      "min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize text-sk-ink sm:text-base",
    weekday: "py-1 font-medium text-sk-ink/50",
    legend: "mt-4 flex flex-wrap gap-3 text-xs text-sk-ink/70",
    slotDisabled: "bg-sk-ink/10 text-sk-ink/40 line-through",
    slotOn: "bg-sk-cta text-white",
    slotOff: "bg-[#EAF3DE] text-sk-ink",
    slotsSectionLabel: "text-sm font-medium text-sk-ink",
    meta: "mt-2 text-xs text-sk-ink/60",
    labelMuted: "text-sm font-medium text-sk-ink/70",
    field: "sk-field min-h-[48px] w-full text-base sm:text-sm",
    fieldArea: "sk-field min-h-[6rem] w-full resize-y text-base sm:text-sm",
    niveauOn: "bg-sk-cta text-white",
    niveauOff: "border border-sk-outline/25 bg-sk-surface text-sk-ink",
    turnstileBox: "mt-3 rounded border border-sk-ink/10 bg-white/80 p-3",
    turnstileHint: "mb-2 text-xs text-sk-ink/60",
    summaryBox: "rounded bg-sk-surface p-3 text-xs text-sk-ink/80",
    summaryMuted: "mt-2 text-sk-ink/60",
    thanksTitle: "mt-4 text-xl font-semibold text-sk-ink",
    thanksBody:
      "mx-auto mt-2 max-w-md text-base leading-relaxed text-sk-ink/80",
    thanksEmail: "font-medium text-sk-brand",
    refBox:
      "mt-4 inline-block rounded-lg border border-sk-ink/10 bg-white/80 px-3 py-1.5 font-mono text-xs text-sk-ink/60",
    resetBtn:
      "mx-auto mt-8 flex w-full max-w-md min-h-[48px] items-center justify-center rounded-xl border-2 border-sk-cta/35 bg-white px-5 py-3 text-base font-semibold text-sk-cta shadow-sm transition hover:border-sk-cta hover:bg-sk-highlight/40 active:scale-[0.99] sm:text-sm",
    colSelected: "#ab3500",
    calDayText: "#181c20",
  };
}

export function getGuestPortalUi(pilot: boolean) {
  if (pilot) {
    return {
      h1: "text-[1.35rem] font-semibold leading-snug text-[var(--ascent-on-surface)] sm:text-xl",
      intro:
        "mt-3 text-base leading-relaxed text-[var(--ascent-on-surface-variant)] sm:text-sm",
      label: "block text-sm font-medium text-[var(--ascent-on-surface)]",
      field:
        "mt-2 min-h-[48px] w-full rounded-xl border-0 bg-[var(--ascent-container-low)] px-3 py-2.5 text-[var(--ascent-on-surface)] text-base shadow-[inset_0_0_0_1px_rgba(0,88,188,0.12)] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ascent-primary)]/35 sm:text-sm",
      submit:
        "w-full min-h-[48px] rounded-xl bg-gradient-to-br from-[var(--ascent-primary)] to-[var(--ascent-primary-container)] px-4 py-3 text-base font-bold text-white shadow-[0_12px_28px_-8px_rgba(0,88,188,0.35)] transition active:scale-[0.99] disabled:opacity-50",
      dialog:
        "w-[calc(100%-1.5rem)] max-w-md rounded-2xl border-0 bg-white/95 p-5 shadow-xl ring-1 ring-[var(--ascent-primary)]/15 backdrop:bg-black/40 sm:w-[calc(100%-2rem)] sm:p-6",
      dialogTitle:
        "text-lg font-semibold text-[var(--ascent-on-surface)]",
      dialogBody: "mt-2 text-sm text-[var(--ascent-on-surface-variant)]",
      dialogHint: "mt-2 text-xs text-[var(--ascent-on-surface-variant)]/90",
      dialogOutlineBtn:
        "min-h-[48px] w-full rounded-xl border border-[var(--ascent-primary)]/30 bg-white px-4 py-3 text-base font-semibold text-[var(--ascent-primary)] sm:w-auto sm:py-2 sm:text-sm",
      linkBtn:
        "min-h-[44px] self-start text-left text-sm font-semibold text-[var(--ascent-primary)] underline underline-offset-2 sm:min-h-0",
      loading: "mt-6 text-sm text-[var(--ascent-on-surface-variant)]/90",
      empty: "mt-6 text-sm text-[var(--ascent-on-surface-variant)]",
      card: "rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-[var(--ascent-primary)]/10 sm:p-5",
      rowTitle: "font-medium text-[var(--ascent-on-surface)]",
      rowSub: "text-sm text-[var(--ascent-on-surface-variant)]",
      rowMeta: "text-xs text-[var(--ascent-on-surface-variant)]/85",
      invoiceBtn:
        "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[var(--ascent-primary)]/35 bg-white px-4 py-3 text-base font-semibold text-[var(--ascent-primary)] shadow-sm sm:w-auto sm:py-2 sm:text-sm",
    };
  }
  return {
    h1: "text-[1.35rem] font-semibold leading-snug text-sk-ink sm:text-xl",
    intro: "mt-3 text-base leading-relaxed text-sk-ink/80 sm:text-sm",
    label: "block text-sm font-medium text-sk-ink",
    field: "sk-field mt-2 min-h-[48px] w-full text-base sm:text-sm",
    submit:
      "w-full min-h-[48px] rounded-xl bg-sk-cta px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-sk-cta-mid active:scale-[0.99] disabled:opacity-50",
    dialog:
      "w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-sk-ink/15 bg-white p-5 shadow-xl backdrop:bg-black/40 sm:w-[calc(100%-2rem)] sm:p-6",
    dialogTitle: "text-lg font-semibold text-sk-ink",
    dialogBody: "mt-2 text-sm text-sk-ink/80",
    dialogHint: "mt-2 text-xs text-sk-ink/65",
    dialogOutlineBtn:
      "min-h-[48px] w-full rounded-xl border border-sk-outline/40 px-4 py-3 text-base font-semibold text-sk-brand sm:w-auto sm:py-2 sm:text-sm",
    linkBtn:
      "min-h-[44px] self-start text-left text-sm font-semibold text-sk-brand underline sm:min-h-0",
    loading: "mt-6 text-sm text-sk-ink/60",
    empty: "mt-6 text-sm text-sk-ink/70",
    card: "rounded-2xl border border-sk-ink/10 bg-white/90 p-4 shadow-sm sm:p-5",
    rowTitle: "font-medium text-sk-ink",
    rowSub: "text-sm text-sk-ink/80",
    rowMeta: "text-xs text-sk-ink/60",
    invoiceBtn:
      "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-sk-brand/40 px-4 py-3 text-base font-semibold text-sk-brand sm:w-auto sm:py-2 sm:text-sm",
  };
}
