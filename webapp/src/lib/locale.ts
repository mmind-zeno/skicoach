/**
 * Locale für date-fns, react-big-calendar und Intl — abgestimmt auf `brand.htmlLang`
 * (`NEXT_PUBLIC_HTML_LANG`, Standard `de`).
 */
import { format, getDay, startOfWeek } from "date-fns";
import { de, enUS, type Locale } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import { brand } from "@/config/brand";

export const appDateFnsLocale: Locale =
  brand.htmlLang === "en" ? enUS : de;

/** BCP 47 für `Date#toLocaleString` (Datum + Uhrzeit) */
export const appDateTimeLocale =
  brand.htmlLang === "en" ? "en-GB" : "de-CH";

/** BCP 47 für `toLocaleDateString` (PDF / kurze Datumsangaben) */
export const appDateOnlyLocale =
  brand.htmlLang === "en" ? "en-GB" : "de-LI";

/** `culture` für react-big-calendar */
export const calendarCulture = brand.htmlLang === "en" ? "en" : "de";

const calendarLocales =
  brand.htmlLang === "en" ? { en: enUS } : { de };

export const calendarLocalizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales: calendarLocales,
});

/** CHF-Anzeige (Intl) — EN-UI nutzt en-GB, sonst Schweizer Format */
export const currencyFormatLocale =
  brand.htmlLang === "en" ? "en-GB" : "de-CH";
