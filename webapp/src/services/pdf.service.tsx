import React from "react";
import { findById } from "./invoice.service";

function splitVatBrutto(brutto: number, vatPercent: number): {
  net: number;
  vat: number;
} {
  const factor = 1 + vatPercent / 100;
  const net = brutto / factor;
  const vat = brutto - net;
  return { net, vat };
}

export async function generateInvoicePdfBuffer(
  invoiceId: string
): Promise<Buffer> {
  const [{ renderToBuffer }, invoicePdfModule] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../features/invoices/components/InvoicePDFDocument"),
  ]);
  const { InvoicePDFDocument } = invoicePdfModule;

  const inv = await findById(invoiceId);
  const brutto = Number(inv.amountCHF);
  const vatP = Number(inv.vatPercent);
  const { net, vat } = splitVatBrutto(brutto, vatP);

  const doc = (
    <InvoicePDFDocument
      invoiceNumber={inv.invoiceNumber}
      issuedAt={inv.issuedAt}
      guestName={inv.guestName}
      guestEmail={inv.guestEmail}
      courseName={inv.courseName}
      bookingDate={inv.bookingDate}
      teacherName={inv.teacherName}
      amountBrutto={brutto.toFixed(2)}
      netCHF={net.toFixed(2)}
      vatCHF={vat.toFixed(2)}
      vatPercent={inv.vatPercent}
      bankName={process.env.BANK_NAME ?? ""}
      bankIban={process.env.BANK_IBAN ?? ""}
      bankAddress={process.env.BANK_ADDRESS ?? ""}
    />
  );

  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
