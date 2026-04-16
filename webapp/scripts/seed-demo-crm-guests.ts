/**
 * 10 Demo-Gäste im CRM:
 * - je 5 Buchungsanfragen (Februar 2026)
 * - je 5 Kontakt-Einträge (März 2026)
 * - vollständige CRM-Profilfelder (Demo)
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
  bookings,
  courseTypes,
  guestContacts,
  guests,
  invoices,
  users,
} from "../drizzle/schema";
import { getDb } from "../src/lib/db";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DEMO_CRM_SOURCE = "demo_mar_2026";

type DemoGuestSpec = {
  name: string;
  email: string;
  company: string;
  phone: string;
  niveau: "anfaenger" | "fortgeschritten" | "experte";
  salutation: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  dateOfBirth: string;
  gender: "weiblich" | "maennlich" | "divers" | "unbekannt";
  nationality: string;
  heightCm: number;
  weightKg: number;
  shoeSizeEu: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes: string | null;
  preferredContactChannel: "email" | "phone" | "sms" | "whatsapp";
  marketingOptIn: boolean;
};

const DEMO_GUESTS: DemoGuestSpec[] = [
  {
    name: "Demo · Lena Steiner",
    email: "demo-crm-01@skicoach.demo",
    company: "Alpin Reisen AG",
    phone: "+41 79 111 01 01",
    niveau: "anfaenger",
    salutation: "Frau",
    street: "Zollstrasse 12",
    postalCode: "9490",
    city: "Vaduz",
    country: "LI",
    dateOfBirth: "1994-06-18",
    gender: "weiblich",
    nationality: "CH",
    heightCm: 168,
    weightKg: 58,
    shoeSizeEu: "39",
    emergencyContactName: "Thomas Steiner",
    emergencyContactPhone: "+41 79 888 01 01",
    medicalNotes: "Keine bekannten Allergien (Demo).",
    preferredContactChannel: "email",
    marketingOptIn: true,
  },
  {
    name: "Demo · Marco Frey",
    email: "demo-crm-02@skicoach.demo",
    company: "Bergzeit Events",
    phone: "+41 79 111 02 02",
    niveau: "fortgeschritten",
    salutation: "Herr",
    street: "Industriestrasse 4a",
    postalCode: "9494",
    city: "Schaan",
    country: "LI",
    dateOfBirth: "1988-11-03",
    gender: "maennlich",
    nationality: "LI",
    heightCm: 182,
    weightKg: 78,
    shoeSizeEu: "44",
    emergencyContactName: "Sandra Frey",
    emergencyContactPhone: "+423 388 02 02",
    medicalNotes: null,
    preferredContactChannel: "whatsapp",
    marketingOptIn: false,
  },
  {
    name: "Demo · Sara Koller",
    email: "demo-crm-03@skicoach.demo",
    company: "Schnee & Sonne GmbH",
    phone: "+41 79 111 03 03",
    niveau: "experte",
    salutation: "Frau",
    street: "Seestrasse 88",
    postalCode: "8800",
    city: "Thalwil",
    country: "CH",
    dateOfBirth: "1991-02-22",
    gender: "weiblich",
    nationality: "CH",
    heightCm: 172,
    weightKg: 62,
    shoeSizeEu: "40",
    emergencyContactName: "Reto Koller",
    emergencyContactPhone: "+41 79 888 03 03",
    medicalNotes: "Pollenallergie leicht — Antihistaminik dabei (Demo).",
    preferredContactChannel: "sms",
    marketingOptIn: true,
  },
  {
    name: "Demo · Jonas Wirth",
    email: "demo-crm-04@skicoach.demo",
    company: "WinterSport Club",
    phone: "+41 79 111 04 04",
    niveau: "anfaenger",
    salutation: "Herr",
    street: "Bahnhofplatz 3",
    postalCode: "7000",
    city: "Chur",
    country: "CH",
    dateOfBirth: "2002-09-07",
    gender: "maennlich",
    nationality: "CH",
    heightCm: 176,
    weightKg: 70,
    shoeSizeEu: "42",
    emergencyContactName: "Claudia Wirth",
    emergencyContactPhone: "+41 81 555 04 04",
    medicalNotes: null,
    preferredContactChannel: "phone",
    marketingOptIn: false,
  },
  {
    name: "Demo · Nina Gerber",
    email: "demo-crm-05@skicoach.demo",
    company: "Peak Logistics",
    phone: "+41 79 111 05 05",
    niveau: "fortgeschritten",
    salutation: "Frau",
    street: "Neugasse 15",
    postalCode: "8001",
    city: "Zürich",
    country: "CH",
    dateOfBirth: "1985-12-01",
    gender: "divers",
    nationality: "DE",
    heightCm: 170,
    weightKg: 65,
    shoeSizeEu: "41",
    emergencyContactName: "Alex Gerber",
    emergencyContactPhone: "+49 151 555 05 05",
    medicalNotes: null,
    preferredContactChannel: "email",
    marketingOptIn: true,
  },
  {
    name: "Demo · Felix Brunner",
    email: "demo-crm-06@skicoach.demo",
    company: "Talhotel Partner",
    phone: "+41 79 111 06 06",
    niveau: "anfaenger",
    salutation: "Herr",
    street: "Dorfstrasse 2",
    postalCode: "9497",
    city: "Triesenberg",
    country: "LI",
    dateOfBirth: "1999-04-14",
    gender: "maennlich",
    nationality: "AT",
    heightCm: 178,
    weightKg: 72,
    shoeSizeEu: "43",
    emergencyContactName: "Hotel Reception (Demo)",
    emergencyContactPhone: "+423 265 06 06",
    medicalNotes: "Vegetarische Verpflegung bevorzugt (Demo).",
    preferredContactChannel: "whatsapp",
    marketingOptIn: false,
  },
  {
    name: "Demo · Julia Marti",
    email: "demo-crm-07@skicoach.demo",
    company: "Ski-Schule Zentrum",
    phone: "+41 79 111 07 07",
    niveau: "fortgeschritten",
    salutation: "Frau",
    street: "Postgasse 7",
    postalCode: "3900",
    city: "Brig",
    country: "CH",
    dateOfBirth: "1993-07-30",
    gender: "weiblich",
    nationality: "CH",
    heightCm: 165,
    weightKg: 55,
    shoeSizeEu: "38",
    emergencyContactName: "Peter Marti",
    emergencyContactPhone: "+41 27 555 07 07",
    medicalNotes: null,
    preferredContactChannel: "phone",
    marketingOptIn: true,
  },
  {
    name: "Demo · Tim Schmid",
    email: "demo-crm-08@skicoach.demo",
    company: "Freeride Collective",
    phone: "+41 79 111 08 08",
    niveau: "experte",
    salutation: "Herr",
    street: "Talstrasse 101",
    postalCode: "7250",
    city: "Klosters",
    country: "CH",
    dateOfBirth: "1987-01-19",
    gender: "maennlich",
    nationality: "CH",
    heightCm: 188,
    weightKg: 85,
    shoeSizeEu: "45",
    emergencyContactName: "Miriam Schmid",
    emergencyContactPhone: "+41 79 888 08 08",
    medicalNotes: "Kontaktlinsen statt Brille auf der Piste (Demo).",
    preferredContactChannel: "sms",
    marketingOptIn: false,
  },
  {
    name: "Demo · Eva Roth",
    email: "demo-crm-09@skicoach.demo",
    company: "Familie Roth (Privat)",
    phone: "+41 79 111 09 09",
    niveau: "anfaenger",
    salutation: "Frau",
    street: "Winkelweg 9",
    postalCode: "9495",
    city: "Triesen",
    country: "LI",
    dateOfBirth: "2010-03-08",
    gender: "weiblich",
    nationality: "LI",
    heightCm: 152,
    weightKg: 42,
    shoeSizeEu: "36",
    emergencyContactName: "Martin Roth (Vater)",
    emergencyContactPhone: "+423 399 09 09",
    medicalNotes: "Minderjährig — Eltern informieren (Demo).",
    preferredContactChannel: "email",
    marketingOptIn: false,
  },
  {
    name: "Demo · Lukas Baumann",
    email: "demo-crm-10@skicoach.demo",
    company: "Corporate Ski Days",
    phone: "+41 79 111 10 10",
    niveau: "fortgeschritten",
    salutation: "Herr",
    street: "Hardstrasse 220",
    postalCode: "8005",
    city: "Zürich",
    country: "CH",
    dateOfBirth: "1980-10-25",
    gender: "unbekannt",
    nationality: "CH",
    heightCm: 180,
    weightKg: 80,
    shoeSizeEu: "43",
    emergencyContactName: "Büro Assistentin (Demo)",
    emergencyContactPhone: "+41 44 555 10 10",
    medicalNotes: null,
    preferredContactChannel: "email",
    marketingOptIn: true,
  },
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
    await db.delete(invoices).where(inArray(invoices.guestId, ids));
    await db.delete(bookings).where(inArray(bookings.guestId, ids));
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
        notes:
          "Automatisch angelegt (Demo CRM: volles Profil, Anfragen Feb 2026, Kontakte März 2026).",
        salutation: spec.salutation,
        street: spec.street,
        postalCode: spec.postalCode,
        city: spec.city,
        country: spec.country,
        dateOfBirth: new Date(`${spec.dateOfBirth}T12:00:00Z`),
        gender: spec.gender,
        nationality: spec.nationality,
        heightCm: spec.heightCm,
        weightKg: spec.weightKg,
        shoeSizeEu: spec.shoeSizeEu,
        emergencyContactName: spec.emergencyContactName,
        emergencyContactPhone: spec.emergencyContactPhone,
        medicalNotes: spec.medicalNotes,
        preferredContactChannel: spec.preferredContactChannel,
        marketingOptIn: spec.marketingOptIn,
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
    crmFields: "vollständig (Adresse, Person, Ausrüstung, Notfall, Sonstiges)",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
