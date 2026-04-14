import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "teacher"]);
export const guestNiveauEnum = pgEnum("guest_niveau", [
  "anfaenger",
  "fortgeschritten",
  "experte",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "geplant",
  "durchgefuehrt",
  "storniert",
]);
export const bookingSourceEnum = pgEnum("booking_source", [
  "intern",
  "anfrage",
  "online",
]);
export const bookingRequestStatusEnum = pgEnum("booking_request_status", [
  "neu",
  "bestaetigt",
  "abgelehnt",
]);
/** Manuelle Stunden: Büro, Vorbereitung, etc. (vgl. ERP „internal / non-billable“). */
export const staffTimeLogCategoryEnum = pgEnum("staff_time_log_category", [
  "buero_verwaltung",
  "vorbereitung",
  "meeting",
  "fortbildung",
  "sonstiges",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "offen",
  "bezahlt",
  "storniert",
]);
/** KVG Arbeitgeberanteil: Erwachsene vs. Jugendliche (16–20), vgl. Merkblatt 2026. */
export const staffKvgAgeBandEnum = pgEnum("staff_kvg_age_band", [
  "adult",
  "youth_16_20",
]);

// ── NextAuth + App: users ───────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("teacher"),
  phone: text("phone"),
  colorIndex: integer("color_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/** Auth.js erwartet Composit-PK (provider, providerAccountId); Tabellenname "account". */
export const accounts = pgTable(
  "account",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
    userIdx: index("account_user_id_idx").on(t.userId),
  })
);

export const sessions = pgTable(
  "session",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_id_idx").on(t.userId),
  })
);

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

/** WebAuthn — mit angeben, damit der Drizzle-Adapter nicht auf die Default-„user“-Tabelle fällt */
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (a) => ({
    pk: primaryKey({ columns: [a.userId, a.credentialID] }),
  })
);

/** Für DrizzleAdapter(db, authAdapterTables) */
export const authAdapterTables = {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
  authenticatorsTable: authenticators,
};

// ── Domain ──────────────────────────────────────────────────────────────────

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    niveau: guestNiveauEnum("niveau").notNull().default("anfaenger"),
    language: text("language").notNull().default("de"),
    notes: text("notes"),
    company: text("company"),
    crmSource: text("crm_source"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index("guests_email_idx").on(t.email),
  })
);

export const guestContacts = pgTable(
  "guest_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    kind: text("kind").notNull().default("note"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    guestCreatedIdx: index("guest_contacts_guest_created_idx").on(
      t.guestId,
      t.createdAt
    ),
  })
);

/** Buchbare Kapazität: meist 1:1 mit User (Lehrkraft); optional eigener Name für Forks. */
export const bookableResources = pgTable(
  "bookable_resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userUnique: uniqueIndex("bookable_resources_user_id_unique").on(t.userId),
  })
);

/**
 * Wiederkehrende Arbeitsfenster pro Wochentag (1 = Mo … 7 = So, ISO).
 * Keine Zeilen = Legacy: nur Raster07:00–20:00 + Sperrzeiten/Buchungen.
 */
export const staffWeeklyAvailability = pgTable(
  "staff_weekly_availability",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userDayIdx: index("staff_weekly_availability_user_day_idx").on(
      t.userId,
      t.dayOfWeek
    ),
  })
);

/** Ferien / Abwesenheit: ganze Kalendertage (inkl. start/end) für eine Person. */
export const staffVacationPeriods = pgTable(
  "staff_vacation_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startDate: date("start_date", { mode: "date" }).notNull(),
    endDate: date("end_date", { mode: "date" }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userRangeIdx: index("staff_vacation_periods_user_range_idx").on(
      t.userId,
      t.startDate,
      t.endDate
    ),
  })
);

/** Manuelle Arbeitsstunden pro Tag (nicht aus Buchungen ableitbar). */
export const staffTimeLogs = pgTable(
  "staff_time_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workDate: date("work_date", { mode: "date" }).notNull(),
    hours: decimal("hours", { precision: 6, scale: 2, mode: "string" }).notNull(),
    category: staffTimeLogCategoryEnum("category").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userDateIdx: index("staff_time_logs_user_date_idx").on(t.userId, t.workDate),
  })
);

/** Bruttolohn pro Stunde & FL-Lohn-Hilfsfelder (AHV/KVG/Steuer — keine Rechtsberatung). */
export const staffPayrollProfiles = pgTable("staff_payroll_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  grossHourlyRateChf: decimal("gross_hourly_rate_chf", {
    precision: 10,
    scale: 2,
    mode: "string",
  }),
  weeklyHoursForKvg: decimal("weekly_hours_for_kvg", {
    precision: 6,
    scale: 2,
    mode: "string",
  }),
  kvgAgeBand: staffKvgAgeBandEnum("kvg_age_band").notNull().default("adult"),
  applyWht4pct: boolean("apply_wht_4pct").notNull().default(true),
  merkblattSmallEmploymentAck: boolean("merkblatt_small_employment_ack")
    .notNull()
    .default(false),
  ahvNumber: text("ahv_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

/** Sperrzeit / Pause im Kalender einer Person (user_id). */
export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockDate: date("block_date", { mode: "date" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userDateIdx: index("availability_blocks_user_date_idx").on(
      t.userId,
      t.blockDate
    ),
  })
);

/** Ausgehende Hook-URLs (n8n o. ä.), siehe webapp/src/lib/outbound-webhooks.ts */
export const outboundWebhooks = pgTable("outbound_webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const courseTypes = pgTable(
  "course_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    durationMin: integer("duration_min").notNull(),
    priceCHF: decimal("price_chf", { precision: 10, scale: 2, mode: "string" }).notNull(),
    maxParticipants: integer("max_participants").notNull().default(1),
    isPublic: boolean("is_public").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    activePublicIdx: index("course_types_active_public_idx").on(t.isActive, t.isPublic),
  })
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id),
    courseTypeId: uuid("course_type_id")
      .notNull()
      .references(() => courseTypes.id),
    date: date("date", { mode: "date" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: bookingStatusEnum("status").notNull().default("geplant"),
    source: bookingSourceEnum("source").notNull().default("intern"),
    notes: text("notes"),
    priceCHF: decimal("price_chf", { precision: 10, scale: 2, mode: "string" }).notNull(),
    resourceId: uuid("resource_id").references(() => bookableResources.id, {
      onDelete: "set null",
    }),
    paymentStatus: text("payment_status").notNull().default("none"),
    paymentExternalRef: text("payment_external_ref"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    teacherDateIdx: index("bookings_teacher_date_idx").on(t.teacherId, t.date),
    guestIdx: index("bookings_guest_idx").on(t.guestId),
    dateIdx: index("bookings_date_idx").on(t.date),
    courseTypeIdx: index("bookings_course_type_idx").on(t.courseTypeId),
    resourceIdx: index("bookings_resource_id_idx").on(t.resourceId),
  })
);

export const bookingRequests = pgTable(
  "booking_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseTypeId: uuid("course_type_id")
      .notNull()
      .references(() => courseTypes.id),
    date: date("date", { mode: "date" }).notNull(),
    startTime: time("start_time").notNull(),
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email").notNull(),
    guestPhone: text("guest_phone"),
    guestNiveau: guestNiveauEnum("guest_niveau").notNull(),
    message: text("message"),
    status: bookingRequestStatusEnum("status").notNull().default("neu"),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    handledBy: uuid("handled_by").references(() => users.id, {
      onDelete: "set null",
    }),
    handledAt: timestamp("handled_at", { mode: "date" }),
    rejectReason: text("reject_reason"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    statusCreatedIdx: index("booking_requests_status_created_idx").on(
      t.status,
      t.createdAt
    ),
    courseDateIdx: index("booking_requests_course_date_idx").on(
      t.courseTypeId,
      t.date
    ),
  })
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNumber: text("invoice_number").notNull().unique(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id),
    amountCHF: decimal("amount_chf", { precision: 10, scale: 2, mode: "string" }).notNull(),
    vatPercent: decimal("vat_percent", { precision: 5, scale: 2, mode: "string" })
      .notNull()
      .default("7.7"),
    status: invoiceStatusEnum("status").notNull().default("offen"),
    pdfUrl: text("pdf_url"),
    issuedAt: timestamp("issued_at", { mode: "date" }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { mode: "date" }),
    dueDate: date("due_date", { mode: "date" }),
  },
  (t) => ({
    bookingUnq: uniqueIndex("invoices_booking_id_unique").on(t.bookingId),
    guestIdx: index("invoices_guest_idx").on(t.guestId),
    statusIdx: index("invoices_status_idx").on(t.status),
  })
);

export const chatChannels = pgTable("chat_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isGeneral: boolean("is_general").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/** Verteiltes Rate-Limiting (mehrere App-Instanzen teilen sich Postgres). */
export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    bucketKey: text("bucket_key").primaryKey(),
    hitCount: integer("hit_count").notNull(),
    windowExpiresAt: timestamp("window_expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    expiresIdx: index("rate_limit_buckets_expires_idx").on(t.windowExpiresAt),
  })
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    resource: text("resource"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    clientIp: text("client_ip"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    createdIdx: index("audit_logs_created_at_idx").on(t.createdAt),
    actorIdx: index("audit_logs_actor_idx").on(t.actorUserId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: uuid("channel_id").references(() => chatChannels.id, {
      onDelete: "cascade",
    }),
    recipientId: uuid("recipient_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    attachmentUrl: text("attachment_url"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    readAt: timestamp("read_at", { mode: "date" }),
  },
  (t) => ({
    channelCreatedIdx: index("chat_messages_channel_created_idx").on(
      t.channelId,
      t.createdAt
    ),
    dmIdx: index("chat_messages_dm_idx").on(t.senderId, t.recipientId),
  })
);

// ── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
  bookingsAsTeacher: many(bookings, { relationName: "teacher" }),
  handledBookingRequests: many(bookingRequests),
  authoredGuestContacts: many(guestContacts),
  bookableResource: one(bookableResources, {
    fields: [users.id],
    references: [bookableResources.userId],
  }),
  availabilityBlocks: many(availabilityBlocks),
  staffWeeklyAvailability: many(staffWeeklyAvailability),
  staffVacationPeriods: many(staffVacationPeriods),
  staffTimeLogs: many(staffTimeLogs),
  payrollProfile: one(staffPayrollProfiles, {
    fields: [users.id],
    references: [staffPayrollProfiles.userId],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, { fields: [authenticators.userId], references: [users.id] }),
}));

export const guestsRelations = relations(guests, ({ many }) => ({
  bookings: many(bookings),
  invoices: many(invoices),
  contacts: many(guestContacts),
}));

export const guestContactsRelations = relations(guestContacts, ({ one }) => ({
  guest: one(guests, {
    fields: [guestContacts.guestId],
    references: [guests.id],
  }),
  author: one(users, {
    fields: [guestContacts.authorUserId],
    references: [users.id],
  }),
}));

export const courseTypesRelations = relations(courseTypes, ({ many }) => ({
  bookings: many(bookings),
  bookingRequests: many(bookingRequests),
}));

export const bookableResourcesRelations = relations(
  bookableResources,
  ({ one, many }) => ({
    user: one(users, {
      fields: [bookableResources.userId],
      references: [users.id],
    }),
    bookings: many(bookings),
  })
);

export const availabilityBlocksRelations = relations(
  availabilityBlocks,
  ({ one }) => ({
    user: one(users, {
      fields: [availabilityBlocks.userId],
      references: [users.id],
    }),
  })
);

export const staffWeeklyAvailabilityRelations = relations(
  staffWeeklyAvailability,
  ({ one }) => ({
    user: one(users, {
      fields: [staffWeeklyAvailability.userId],
      references: [users.id],
    }),
  })
);

export const staffVacationPeriodsRelations = relations(
  staffVacationPeriods,
  ({ one }) => ({
    user: one(users, {
      fields: [staffVacationPeriods.userId],
      references: [users.id],
    }),
  })
);

export const staffTimeLogsRelations = relations(staffTimeLogs, ({ one }) => ({
  user: one(users, {
    fields: [staffTimeLogs.userId],
    references: [users.id],
  }),
}));

export const staffPayrollProfilesRelations = relations(
  staffPayrollProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [staffPayrollProfiles.userId],
      references: [users.id],
    }),
  })
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  teacher: one(users, {
    fields: [bookings.teacherId],
    references: [users.id],
    relationName: "teacher",
  }),
  guest: one(guests, { fields: [bookings.guestId], references: [guests.id] }),
  courseType: one(courseTypes, {
    fields: [bookings.courseTypeId],
    references: [courseTypes.id],
  }),
  resource: one(bookableResources, {
    fields: [bookings.resourceId],
    references: [bookableResources.id],
  }),
  invoices: many(invoices),
  fulfilledFromRequest: one(bookingRequests, {
    fields: [bookings.id],
    references: [bookingRequests.bookingId],
  }),
}));

export const bookingRequestsRelations = relations(bookingRequests, ({ one }) => ({
  courseType: one(courseTypes, {
    fields: [bookingRequests.courseTypeId],
    references: [courseTypes.id],
  }),
  booking: one(bookings, {
    fields: [bookingRequests.bookingId],
    references: [bookings.id],
  }),
  handler: one(users, {
    fields: [bookingRequests.handledBy],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(bookings, { fields: [invoices.bookingId], references: [bookings.id] }),
  guest: one(guests, { fields: [invoices.guestId], references: [guests.id] }),
}));

export const chatChannelsRelations = relations(chatChannels, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  channel: one(chatChannels, {
    fields: [chatMessages.channelId],
    references: [chatChannels.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [chatMessages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

// ── Inferred types (Services / API) ─────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type CourseType = typeof courseTypes.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type ChatChannel = typeof chatChannels.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GuestContact = typeof guestContacts.$inferSelect;

/** Explizit für `drizzle()` — ohne `authAdapterTables` / reine Typ-Exports */
export const dbSchema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
  guests,
  guestContacts,
  bookableResources,
  availabilityBlocks,
  staffWeeklyAvailability,
  staffVacationPeriods,
  staffTimeLogs,
  staffPayrollProfiles,
  outboundWebhooks,
  courseTypes,
  bookings,
  bookingRequests,
  invoices,
  chatChannels,
  chatMessages,
  rateLimitBuckets,
  auditLogs,
  usersRelations,
  accountsRelations,
  sessionsRelations,
  authenticatorsRelations,
  guestsRelations,
  guestContactsRelations,
  bookableResourcesRelations,
  availabilityBlocksRelations,
  staffWeeklyAvailabilityRelations,
  staffVacationPeriodsRelations,
  staffTimeLogsRelations,
  staffPayrollProfilesRelations,
  courseTypesRelations,
  bookingsRelations,
  bookingRequestsRelations,
  invoicesRelations,
  chatChannelsRelations,
  chatMessagesRelations,
};
