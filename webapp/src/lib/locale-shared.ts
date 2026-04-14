/**
 * Locale-Helfer für date-fns und Intl — ohne react-big-calendar.
 * Öffentliche Seiten (z. B. Buchungs-Wizard) sollen hier importieren, damit
 * der Client-Chunk nicht unnötig `react-big-calendar` lädt.
 */
import { de, enUS, type Locale } from "date-fns/locale";
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

/** CHF-Anzeige (Intl) — EN-UI nutzt en-GB, sonst Schweizer Format */
export const currencyFormatLocale =
  brand.htmlLang === "en" ? "en-GB" : "de-CH";

/** date-fns-Locale-Map für den RBC-Localizer (nur Kalender-Feature) */
export const calendarLocales =
  brand.htmlLang === "en" ? { en: enUS } : { de };
