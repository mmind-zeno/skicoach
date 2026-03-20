/**
 * Dev-Seed gemäss PROMPTS.md (vereinfacht, idempotent per E-Mail / Namen).
 * Ausführung im Ordner webapp: npm run db:seed
 */
import { config } from "dotenv";
import { addDays, format } from "date-fns";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";
import {
  bookingRequests,
  bookings,
  chatChannels,
  chatMessages,
  courseTypes,
  guests,
  users,
} from "../drizzle/schema";
import { getDb } from "../src/lib/db";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function ensureUser(opts: {
  email: string;
  name: string;
  role: "admin" | "teacher";
  colorIndex: number;
}) {
  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, opts.email),
  });
  if (existing) return existing;
  const [row] = await db
    .insert(users)
    .values({
      email: opts.email,
      name: opts.name,
      role: opts.role,
      colorIndex: opts.colorIndex,
      isActive: true,
      emailVerified: new Date(),
    })
    .returning();
  if (!row) throw new Error(`User ${opts.email}`);
  return row;
}

async function main() {
  const db = getDb();

  const admin = await ensureUser({
    email: "admin@skicoach.li",
    name: "Admin",
    role: "admin",
    colorIndex: 0,
  });

  const teacherRows: Awaited<ReturnType<typeof ensureUser>>[] = [];
  for (let i = 1; i <= 4; i++) {
    teacherRows.push(
      await ensureUser({
        email: `lehrer${i}@skicoach.li`,
        name: `Lehrer ${i}`,
        role: "teacher",
        colorIndex: i,
      })
    );
  }
  const t1 = teacherRows[0]!;

  let ct1 = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.name, "Privat 1h"),
  });
  if (!ct1) {
    const [c] = await db
      .insert(courseTypes)
      .values({
        name: "Privat 1h",
        durationMin: 60,
        priceCHF: "120.00",
        maxParticipants: 1,
        isPublic: true,
        isActive: true,
      })
      .returning();
    ct1 = c!;
  }

  let ct2 = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.name, "Privat 2h"),
  });
  if (!ct2) {
    const [c] = await db
      .insert(courseTypes)
      .values({
        name: "Privat 2h",
        durationMin: 120,
        priceCHF: "220.00",
        maxParticipants: 1,
        isPublic: true,
        isActive: true,
      })
      .returning();
    ct2 = c!;
  }

  let ct3 = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.name, "Gruppe"),
  });
  if (!ct3) {
    const [c] = await db
      .insert(courseTypes)
      .values({
        name: "Gruppe",
        durationMin: 90,
        priceCHF: "80.00",
        maxParticipants: 6,
        isPublic: true,
        isActive: true,
      })
      .returning();
    ct3 = c!;
  }

  const guestNames = ["Anna Müller", "Ben Meier", "Clara Huber", "Dan Wolf", "Eva Fuchs"];
  const guestRows: (typeof guests.$inferSelect)[] = [];
  for (let i = 0; i < guestNames.length; i++) {
    const name = guestNames[i]!;
    const existing = await db.query.guests.findFirst({ where: eq(guests.name, name) });
    if (existing) {
      guestRows.push(existing);
      continue;
    }
    const [g] = await db
      .insert(guests)
      .values({
        name,
        email: `gast${i + 1}@example.test`,
        niveau: i % 3 === 0 ? "anfaenger" : i % 3 === 1 ? "fortgeschritten" : "experte",
      })
      .returning();
    guestRows.push(g!);
  }

  const anyBooking = await db.query.bookings.findFirst({ columns: { id: true } });
  if (!anyBooking) {
    const base = addDays(new Date(), 10);
    for (let i = 0; i < guestRows.length; i++) {
      const g = guestRows[i]!;
      const d = addDays(base, i);
      await db.insert(bookings).values({
        teacherId: t1.id,
        guestId: g.id,
        courseTypeId: ct1.id,
        date: d,
        startTime: "10:00:00",
        endTime: "11:00:00",
        status: "geplant",
        source: "intern",
        priceCHF: ct1.priceCHF,
      });
      if (i % 2 === 0) {
        await db.insert(bookings).values({
          teacherId: teacherRows[1]!.id,
          guestId: g.id,
          courseTypeId: ct2.id,
          date: addDays(d, 1),
          startTime: "14:00:00",
          endTime: "16:00:00",
          status: "durchgefuehrt",
          source: "intern",
          priceCHF: ct2.priceCHF,
        });
      }
    }
  }

  const reqExisting = await db.query.bookingRequests.findMany({ limit: 1 });
  if (reqExisting.length === 0) {
    const d = addDays(new Date(), 14);
    await db.insert(bookingRequests).values({
      courseTypeId: ct1.id,
      date: d,
      startTime: "09:00:00",
      guestName: "Portal Test",
      guestEmail: "portal.test@example.test",
      guestNiveau: "anfaenger",
      message: "Seed-Anfrage",
      status: "neu",
    });
    await db.insert(bookingRequests).values({
      courseTypeId: ct3.id,
      date: addDays(d, 1),
      startTime: "11:00:00",
      guestName: "Ski Fan",
      guestEmail: "ski.fan@example.test",
      guestNiveau: "fortgeschritten",
      status: "neu",
    });
  }

  let team = await db.query.chatChannels.findFirst({
    where: eq(chatChannels.name, "Team"),
  });
  if (!team) {
    const [ch] = await db
      .insert(chatChannels)
      .values({ name: "Team", isGeneral: true })
      .returning();
    team = ch!;
  }

  const msgCount = await db.query.chatMessages.findMany({
    where: eq(chatMessages.channelId, team.id),
    limit: 1,
  });
  if (msgCount.length === 0) {
    const lines = [
      "Willkommen im Team-Kanal!",
      "Bitte Termine im Kalender pflegen.",
      "Bei Fragen: Admin melden.",
      "Schönes Wochenende!",
      "Reminder: Anfragen unter Admin prüfen.",
    ];
    for (let i = 0; i < lines.length; i++) {
      await db.insert(chatMessages).values({
        channelId: team.id,
        senderId: i % 2 === 0 ? admin.id : t1.id,
        content: lines[i]!,
        createdAt: addDays(new Date(), i - 5),
      });
    }
  }

  console.log("Seed OK:", {
    admin: admin.email,
    teachers: teacherRows.length,
    courseTypes: [ct1.name, ct2.name, ct3.name],
    guests: guestRows.length,
    teamChannel: team.name,
    hint: `Heute+10 Termine ab ${format(addDays(new Date(), 10), "yyyy-MM-dd")}`,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
