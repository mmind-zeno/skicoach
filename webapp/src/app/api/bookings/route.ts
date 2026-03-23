import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
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

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: brand.labels.apiUnauthorized },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = listBookingsQuerySchema.safeParse({
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    teacherId: searchParams.get("teacherId") ?? undefined,
    all: (searchParams.get("all") as "0" | "1") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: brand.labels.apiBookingListDateRangeRequired },
      { status: 400 }
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
      return NextResponse.json(
        { error: brand.labels.apiForbidden },
        { status: 403 }
      );
    }
    const list = await findByTeacher(tid, from, to);
    return NextResponse.json(list);
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: brand.labels.apiUnauthorized },
      { status: 401 }
    );
  }

  try {
    const json = await request.json();
    const body = createBookingBodySchema.parse(json);
    if (session.user.role !== "admin" && body.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: brand.labels.apiForbidden },
        { status: 403 }
      );
    }
    const created = await createBooking(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      { error: brand.labels.apiInvalidData },
      { status: 400 }
    );
  }
}
