import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { guests, newsletterCampaigns } from "../../drizzle/schema";
import { getDb } from "../lib/db";
import { sendNewsletterToGuest } from "../lib/mail";
import { NotFoundError, ValidationError } from "../lib/errors";
import { brand } from "../config/brand";

export type NewsletterCampaignRow = {
  id: string;
  subject: string;
  htmlBody: string;
  status: string;
  sentAt: string | null;
  recipientCount: number;
  sentCount: number;
  createdAt: string;
};

function rowToDto(row: typeof newsletterCampaigns.$inferSelect): NewsletterCampaignRow {
  return {
    id: row.id,
    subject: row.subject,
    htmlBody: row.htmlBody,
    status: row.status,
    sentAt: row.sentAt?.toISOString() ?? null,
    recipientCount: row.recipientCount,
    sentCount: row.sentCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listNewsletterCampaigns(
  limit = 40
): Promise<NewsletterCampaignRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(newsletterCampaigns)
    .orderBy(desc(newsletterCampaigns.createdAt))
    .limit(limit);
  return rows.map(rowToDto);
}

export async function createNewsletterDraft(input: {
  subject: string;
  htmlBody: string;
  createdByUserId: string;
}): Promise<NewsletterCampaignRow> {
  const db = getDb();
  const [row] = await db
    .insert(newsletterCampaigns)
    .values({
      subject: input.subject.trim(),
      htmlBody: input.htmlBody,
      status: "draft",
      createdByUserId: input.createdByUserId,
    })
    .returning();
  if (!row) throw new ValidationError(brand.labels.newsletterCreateFailed);
  return rowToDto(row);
}

export async function getNewsletterCampaign(
  id: string
): Promise<NewsletterCampaignRow> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(newsletterCampaigns)
    .where(eq(newsletterCampaigns.id, id))
    .limit(1);
  if (!row)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.newsletterSingular
      )
    );
  return rowToDto(row);
}

/** Gäste mit Marketing-Opt-in und E-Mail */
export async function countNewsletterRecipients(): Promise<number> {
  const db = getDb();
  const [r] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(guests)
    .where(
      and(eq(guests.marketingOptIn, true), isNotNull(guests.email))
    );
  return Number(r?.c ?? 0);
}

export async function sendNewsletterCampaign(
  id: string
): Promise<NewsletterCampaignRow> {
  const db = getDb();
  const [campaign] = await db
    .select()
    .from(newsletterCampaigns)
    .where(eq(newsletterCampaigns.id, id))
    .limit(1);
  if (!campaign)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.newsletterSingular
      )
    );
  if (campaign.status === "sent") {
    throw new ValidationError(brand.labels.newsletterAlreadySent);
  }

  const audience = await db
    .select({
      id: guests.id,
      name: guests.name,
      email: guests.email,
    })
    .from(guests)
    .where(
      and(eq(guests.marketingOptIn, true), isNotNull(guests.email))
    );

  const valid = audience.filter((g) => g.email?.trim());
  await db
    .update(newsletterCampaigns)
    .set({
      recipientCount: valid.length,
      status: "sending",
    })
    .where(eq(newsletterCampaigns.id, id));

  let sent = 0;
  try {
    for (const g of valid) {
      const email = g.email!.trim();
      try {
        await sendNewsletterToGuest({
          to: email,
          guestName: g.name,
          subject: campaign.subject,
          htmlFragment: campaign.htmlBody,
        });
        sent += 1;
      } catch {
        // einzelne Fehler überspringen
      }
      await new Promise((r) => setTimeout(r, 120));
    }

    const [updated] = await db
      .update(newsletterCampaigns)
      .set({
        status: "sent",
        sentAt: new Date(),
        sentCount: sent,
      })
      .where(eq(newsletterCampaigns.id, id))
      .returning();

    if (!updated) throw new ValidationError(brand.labels.newsletterSendFailed);
    return rowToDto(updated);
  } catch (e) {
    await db
      .update(newsletterCampaigns)
      .set({ status: "draft" })
      .where(eq(newsletterCampaigns.id, id));
    throw e;
  }
}
