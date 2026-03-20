import { NextResponse } from "next/server";
import { requireAuthSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { canAccessInvoice } from "@/services/invoice.service";
import { generateInvoicePdfBuffer } from "@/services/pdf.service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  try {
    const ok = await canAccessInvoice(
      params.id,
      session.user.id,
      session.user.role
    );
    if (!ok) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const buf = await generateInvoicePdfBuffer(params.id);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rechnung-${params.id}.pdf"`,
      },
    });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}
