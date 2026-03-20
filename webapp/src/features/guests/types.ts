export type GuestNiveau = "anfaenger" | "fortgeschritten" | "experte";
export type BookingStatus = "geplant" | "durchgefuehrt" | "storniert";
export type BookingSource = "intern" | "anfrage" | "online";

export type GuestContactKind = "note" | "call" | "email" | "meeting";

export interface GuestContactEntry {
  id: string;
  kind: GuestContactKind;
  body: string;
  createdAt: string;
  authorName: string | null;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  niveau: GuestNiveau;
  language: string;
  notes: string | null;
  company: string | null;
  crmSource: string | null;
  createdAt: string;
}

export interface GuestListItem extends Guest {
  lastBookingDate: string | null;
  bookingCount: number;
}

export interface GuestBookingSummary {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  source: BookingSource;
  priceCHF: string;
  courseTypeName: string;
  teacherName: string | null;
}

export interface GuestWithBookings extends Guest {
  bookings: GuestBookingSummary[];
  openInvoicesCount: number;
  contacts: GuestContactEntry[];
}

export interface CreateGuestInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  niveau?: GuestNiveau;
  language?: string;
  notes?: string | null;
  company?: string | null;
  crmSource?: string | null;
}

export interface UpdateGuestInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  niveau?: GuestNiveau;
  language?: string;
  notes?: string | null;
  company?: string | null;
  crmSource?: string | null;
}
