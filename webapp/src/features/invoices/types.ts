export type InvoiceStatus = "offen" | "bezahlt" | "storniert";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  guestId: string;
  amountCHF: string;
  vatPercent: string;
  status: InvoiceStatus;
  pdfUrl: string | null;
  issuedAt: string;
  paidAt: string | null;
  dueDate: string | null;
}

export interface InvoiceWithDetails extends Invoice {
  guestName: string;
  guestEmail: string | null;
  bookingDate: string;
  courseName: string;
  teacherName: string | null;
}

export interface CreateInvoiceInput {
  bookingId: string;
}
