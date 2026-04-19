import { z } from "zod";

export const patchCommunicationSettingsSchema = z.object({
  reminderHoursBefore: z.number().min(0.5).max(168).optional(),
  reminderWindowHours: z.number().min(0.05).max(48).optional(),
  reminderPollIntervalMs: z.number().int().min(10_000).max(3_600_000).optional(),
  remindersEnabled: z.boolean().optional(),
  reminderMedium: z.enum(["email", "sms", "both"]).optional(),
  reminderSmsWebhookUrl: z.union([z.string().max(2000), z.null()]).optional(),
});

export const createNewsletterDraftSchema = z.object({
  subject: z.string().min(1).max(300),
  htmlBody: z.string().min(1).max(500_000),
});
