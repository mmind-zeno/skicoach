/**
 * Erweitert locale-shared um react-big-calendar — nur importieren, wo der Kalender gebraucht wird.
 */
import { format, getDay, startOfWeek } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import { calendarLocales } from "./locale-shared";

export * from "./locale-shared";

export const calendarLocalizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales: calendarLocales,
});
