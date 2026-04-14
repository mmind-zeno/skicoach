/**
 * Feature-Flags (ein Deployment pro Mandant). Default: alle aktiv (Rückwärtskompatibel).
 * Client: nur NEXT_PUBLIC_* auslesen. Server-APIs nutzen dieselben Keys.
 */
function envFlag(key: string, defaultOn = true): boolean {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no" || v === "off") {
    return false;
  }
  if (v === "true" || v === "1" || v === "yes" || v === "on") {
    return true;
  }
  return defaultOn;
}

export function featurePublicBooking(): boolean {
  return envFlag("NEXT_PUBLIC_FEATURE_PUBLIC_BOOKING");
}

export function featureInvoices(): boolean {
  return envFlag("NEXT_PUBLIC_FEATURE_INVOICES");
}

export function featureChat(): boolean {
  return envFlag("NEXT_PUBLIC_FEATURE_CHAT");
}

/** Zahlungs-UI / künftige Stripe-Anbindung (P2) */
export function featurePayments(): boolean {
  return envFlag("NEXT_PUBLIC_FEATURE_PAYMENTS", false);
}

/** Ausgehende Webhooks (P3) */
export function featureWebhooks(): boolean {
  return envFlag("NEXT_PUBLIC_FEATURE_WEBHOOKS", false);
}

/** iCal-Feed unter /api/calendar/ical (P3) */
export function featureICal(): boolean {
  return envFlag("NEXT_PUBLIC_FEATURE_ICAL", true);
}

export function featureSnapshot(): Record<string, boolean> {
  return {
    publicBooking: featurePublicBooking(),
    invoices: featureInvoices(),
    chat: featureChat(),
    payments: featurePayments(),
    webhooks: featureWebhooks(),
    ical: featureICal(),
  };
}
