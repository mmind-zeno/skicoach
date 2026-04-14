/**
 * 10 Demo-Gäste im CRM:
 * - je 5 Buchungsanfragen (Februar 2026)
 * - je 5 Kontakt-Einträge (März 2026)
 * Idempotent: löscht zuvor Anfragen mit Demo-E-Mails + Gäste mit crm_source = DEMO_CRM_SOURCE.
 *
 *   cd webapp && npm run db:seed:demo-crm
 *
 * Produktion (Container): docker compose exec -T app sh -lc 'cd /app && npm run db:seed:demo-crm'
 */
import { config } from "dotenv";
import { eq, inArray } from "drizzle-orm";
import { resolve } from "node:path";
import {
  bookingRequests,
  courseTypes,
  guestContacts,
  guests,
  users,
} from "../drizzle/schema";
import { getDb } from "../src/lib/db";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DEMO_CRM_SOURCE = "demo_mar_2026";

const DEMO_GUESTS: {
  name: string;
  email: string;
  company: string;
  phone: string;
  niveau: "anfaenger" | "fortgeschritten" | "experte";
}[] = [
  { name: "Demo · Lena Steiner", email: "demo-crm-01@skicoach.demo", company: "Alpin Reisen AG", phone: "+41 79 111 01 01", niveau: "anfaenger" },
  { name: "Demo · Marco Frey", email: "demo-crm-02@skicoach.demo", company: "Bergzeit Events", phone: "+41 79 111 02 02", niveau: "fortgeschritten" },
  { name: "Demo · Sara Koller", email: "demo-crm-03@skicoach.demo", company: "Schnee & Sonne GmbH", phone: "+41 79 111 03 03", niveau: "experte" },
  { name: "Demo · Jonas Wirth", email: "demo-crm-04@skicoach.demo", company: "WinterSport Club", phone: "+41 79 111 04 04", niveau: "anfaenger" },
  { name: "Demo · Nina Gerber", email: "demo-crm-05@skicoach.demo", company: "Peak Logistics", phone: "+41 79 111 05 05", niveau: "fortgeschritten" },
  { name: "Demo · Felix Brunner", email: "demo-crm-06@skicoach.demo", company: "Talhotel Partner", phone: "+41 79 111 06 06", niveau: "anfaenger" },
  { name: "Demo · Julia Marti", email: "demo-crm-07@skicoach.demo", company: "Ski-Schule Zentrum", phone: "+41 79 111 07 07", niveau: "fortgeschritten" },
  { name: "Demo · Tim Schmid", email: "demo-crm-08@skicoach.demo", company: "Freeride Collective", phone: "+41 79 111 08 08", niveau: "experte" },
  { name: "Demo · Eva Roth", email: "demo-crm-09@skicoach.demo", company: "Familie Roth (Privat)", phone: "+41 79 111 09 09", niveau: "anfaenger" },
  { name: "Demo · Lukas Baumann", email: "demo-crm-10@skicoach.demo", company: "Corporate Ski Days", phone: "+41 79 111 10 10", niveau: "fortgeschritten" },
];

const CONTACT_BODIES = [
  "Telefonat: Rückfrage zu Ausrüstung und Pistenwahl — Termin für Beratung vereinbart.",
  "E-Mail: Link zur Pistenkarte und Liftstatus geschickt; Rückmeldung erhalten.",
  "Notiz: Interesse an zusätzlicher Privatstunde vor Saisonende.",
  "WhatsApp: Kurze Absage wegen Wetter; Alternativtermin im März vorgeschlagen.",
  "Follow-up: Offerte für Gruppenkurs besprochen; Entscheidung nach Team-Meeting.",
] as const;

const REQUEST_MESSAGES = [
  "Anfrage Privatstunde Vormittag, bitte Rückmeldung mit freien Slots.",
  "Gruppenkurs für 2 Personen, bevorzugt Wochenende.",
  "Erste Buchung — kurze Frage zu Niveau und Ausrüstung.",
  "Wunschtermin flexibel, alternativ auch Nachmittag.",
  "Follow-up: letzte Woche kurz telefoniert — hier die schriftliche Bestätigung der Daten.",
] as const;

const REQUEST_START_TIMES = [
  "09:00:00",
  "10:30:00",
  "13:00:00",
  "11:30:00",
  "14:00:00",
] as const;

const REQUEST_STATUSES: ("neu" | "bestaetigt" | "abgelehnt")[] = [
  "neu",
  "neu",
  "bestaetigt",
  "abgelehnt",
  "neu",
];

async function main() {
  const db = getDb();

  const admin = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
    columns: { id: true },
  });
  const authorId = admin?.id ?? null;

  const demoEmails = DEMO_GUESTS.map((x) => x.email);
  await db.delete(bookingRequests).where(inArray(bookingRequests.guestEmail, demoEmails));

  const existingIds = await db
    .select({ id: guests.id })
    .from(guests)
    .where(eq(guests.crmSource, DEMO_CRM_SOURCE));

  const ids = existingIds.map((r) => r.id);
  if (ids.length > 0) {
    await db.delete(guestContacts).where(inArray(guestContacts.guestId, ids));
    await db.delete(guests).where(inArray(guests.id, ids));
    console.log("Vorherige Demo-Gäste entfernt:", ids.length);
  }

  let courseType = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.name, "Privat 1h"),
  });
  if (!courseType) {
    courseType = await db.query.courseTypes.findFirst({
      where: eq(courseTypes.isActive, true),
    });
  }
  if (!courseType) {
    throw new Error(
      "Kein Kurstyp gefunden — bitte zuerst db:seed ausführen oder einen aktiven Kurstyp anlegen."
    );
  }

  for (let g = 0; g < DEMO_GUESTS.length; g++) {
    const spec = DEMO_GUESTS[g]!;
    const [guestRow] = await db
      .insert(guests)
      .values({
        name: spec.name,
        email: spec.email,
        phone: spec.phone,
        niveau: spec.niveau,
        language: "de",
        company: spec.company,
        crmSource: DEMO_CRM_SOURCE,
        notes: "Automatisch angelegt (Demo CRM, März 2026).",
      })
      .returning({ id: guests.id });

    if (!guestRow) throw new Error(`Gast ${spec.name}`);

    for (let c = 0; c < 5; c++) {
      const febDay = Math.min(28, 2 + g + c * 5);
      const lessonDate = new Date(Date.UTC(2026, 1, febDay));
      const createdAtReq = new Date(Date.UTC(2026, 1, febDay, 7 + c, 15, 0));
      await db.insert(bookingRequests).values({
        courseTypeId: courseType.id,
        date: lessonDate,
        startTime: REQUEST_START_TIMES[c]!,
        guestName: spec.name,
        guestEmail: spec.email,
        guestPhone: spec.phone,
        guestNiveau: spec.niveau,
        message: REQUEST_MESSAGES[c]!,
        status: REQUEST_STATUSES[c]!,
        createdAt: createdAtReq,
      });
    }

    for (let c = 0; c < 5; c++) {
      const day = 1 + g + c * 5;
      const hour = 9 + c;
      const createdAt = new Date(Date.UTC(2026, 2, day, hour, 30, 0));
      await db.insert(guestContacts).values({
        guestId: guestRow.id,
        authorUserId: authorId,
        kind: "note",
        body: CONTACT_BODIES[c]!,
        createdAt,
      });
    }
  }

  console.log("Demo CRM OK:", {
    guests: DEMO_GUESTS.length,
    bookingRequestsPerGuest: 5,
    bookingRequestsMonth: "2026-02",
    contactsPerGuest: 5,
    contactsMonth: "2026-03",
    crmSource: DEMO_CRM_SOURCE,
    courseType: courseType.name,
    authorUserId: authorId ?? "(kein Admin — author_user_id null)",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
