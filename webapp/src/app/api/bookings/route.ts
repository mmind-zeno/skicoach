import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { parseLocalDateOnly } from "@/lib/datetime";
import {
  createBookingBodySchema,
  listBookingsQuerySchema,
} from "@/lib/validators/booking";
import {
  createBooking,
  findAllInRange,
  findByTeacher,
} from "@/services/booking.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiClientError(brand.labels.apiUnauthorized, 401, undefined, undefined, request);
  }

  const { searchParams } = new URL(request.url);
  const parsed = listBookingsQuerySchema.safeParse({
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    teacherId: searchParams.get("teacherId") ?? undefined,
    all: (searchParams.get("all") as "0" | "1") ?? undefined,
  });
  if (!parsed.success) {
    return apiClientError(
      brand.labels.apiBookingListDateRangeRequired,
      400,
      "INVALID_INPUT",
      undefined,
      request
    );
  }

  const { dateFrom, dateTo, teacherId, all } = parsed.data;
  const from = parseLocalDateOnly(dateFrom);
  const to = parseLocalDateOnly(dateTo);

  try {
    if (session.user.role === "admin" && all === "1") {
      const list = await findAllInRange(from, to);
      return NextResponse.json(list);
    }
    const tid = teacherId ?? session.user.id;
    if (session.user.role !== "admin" && teacherId && teacherId !== session.user.id) {
      return apiClientError(brand.labels.apiForbidden, 403, undefined, undefined, request);
    }
    const list = await findByTeacher(tid, from, to);
    return NextResponse.json(list);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/bookings", { request });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiClientError(brand.labels.apiUnauthorized, 401, undefined, undefined, request);
  }

  try {
    const json = await request.json();
    const body = createBookingBodySchema.parse(json);
    if (session.user.role !== "admin" && body.teacherId !== session.user.id) {
      return apiClientError(brand.labels.apiForbidden, 403, undefined, undefined, request);
    }
    const created = await createBooking(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/bookings", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}
