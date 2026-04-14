/** Nur Typen & reine Funktionen — darf von Client-Komponenten importiert werden. */

export type StaffTimeLogCategory =
  | "buero_verwaltung"
  | "vorbereitung"
  | "meeting"
  | "fortbildung"
  | "sonstiges";

export interface MonthlyHoursBookingLine {
  bookingId: string;
  date: string;
  startTime: string;
  endTime: string;
  minutes: number;
  guestName: string;
  courseName: string;
  status: string;
}

export interface MonthlyHoursTimeLogLine {
  id: string;
  workDate: string;
  hours: string;
  category: StaffTimeLogCategory;
  note: string | null;
}

export interface MonthlyHoursReportDto {
  month: string;
  teacher: { id: string; name: string | null; email: string };
  productiveMinutes: number;
  internalByCategory: Record<StaffTimeLogCategory, number>;
  internalMinutesTotal: number;
  totalWorkedMinutes: number;
  bookingLines: MonthlyHoursBookingLine[];
  timeLogs: MonthlyHoursTimeLogLine[];
  cancelledBookingCount: number;
}

export function formatMinutesAsDecimalHours(minutes: number): string {
  return (minutes / 60).toFixed(2);
}
