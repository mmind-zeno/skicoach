import { appSettings } from "../../drizzle/schema";
import { getDb } from "../lib/db";

export const COMMUNICATION_SETTING_KEYS = {
  reminderHoursBefore: "reminder_hours_before",
  reminderWindowHours: "reminder_window_hours",
  reminderPollIntervalMs: "reminder_poll_interval_ms",
  remindersEnabled: "reminders_enabled",
  reminderMedium: "reminder_medium",
  reminderSmsWebhookUrl: "reminder_sms_webhook_url",
} as const;

export type ReminderMedium = "email" | "sms" | "both";

function envNum(key: string, fallback: number): number {
  const n = Number.parseFloat(process.env[key]?.trim() ?? "");
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function envBool(key: string, defaultTrue: boolean): boolean {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "false" || v === "0") return false;
  if (v === "true" || v === "1") return true;
  return defaultTrue;
}

export type CommunicationSettingsDto = {
  reminderHoursBefore: number;
  reminderWindowHours: number;
  reminderPollIntervalMs: number;
  remindersEnabled: boolean;
  reminderMedium: ReminderMedium;
  reminderSmsWebhookUrl: string;
  /** true wenn mindestens ein Key in DB gespeichert ist */
  hasDbOverrides: boolean;
};

function parseMedium(raw: string | undefined): ReminderMedium {
  if (raw === "sms" || raw === "both") return raw;
  return "email";
}

export function envDefaultsCommunication(): Omit<
  CommunicationSettingsDto,
  "hasDbOverrides"
> {
  return {
    reminderHoursBefore: envNum("REMINDER_HOURS_BEFORE", 24),
    reminderWindowHours: envNum("REMINDER_WINDOW_HOURS", 0.75),
    reminderPollIntervalMs: (() => {
      const n = Number.parseInt(
        process.env.REMINDER_POLL_INTERVAL_MS?.trim() ?? "",
        10
      );
      return Number.isFinite(n) && n >= 10_000 ? n : 900_000;
    })(),
    remindersEnabled: envBool("REMINDER_EMAIL_ENABLED", true),
    reminderMedium: "email",
    reminderSmsWebhookUrl:
      process.env.REMINDER_SMS_WEBHOOK_URL?.trim() ?? "",
  };
}

export async function getCommunicationSettings(): Promise<CommunicationSettingsDto> {
  const db = getDb();
  const rows = await db.select().from(appSettings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const base = envDefaultsCommunication();
  const hasDbOverrides = rows.length > 0;

  const hoursBefore = map.get(COMMUNICATION_SETTING_KEYS.reminderHoursBefore);
  const windowH = map.get(COMMUNICATION_SETTING_KEYS.reminderWindowHours);
  const pollMs = map.get(COMMUNICATION_SETTING_KEYS.reminderPollIntervalMs);
  const enabled = map.get(COMMUNICATION_SETTING_KEYS.remindersEnabled);
  const medium = map.get(COMMUNICATION_SETTING_KEYS.reminderMedium);
  const webhook = map.get(COMMUNICATION_SETTING_KEYS.reminderSmsWebhookUrl);

  return {
    reminderHoursBefore:
      hoursBefore != null && Number.parseFloat(hoursBefore) > 0
        ? Number.parseFloat(hoursBefore)
        : base.reminderHoursBefore,
    reminderWindowHours:
      windowH != null && Number.parseFloat(windowH) > 0
        ? Number.parseFloat(windowH)
        : base.reminderWindowHours,
    reminderPollIntervalMs:
      pollMs != null && Number.parseInt(pollMs, 10) >= 10_000
        ? Number.parseInt(pollMs, 10)
        : base.reminderPollIntervalMs,
    remindersEnabled:
      enabled === "true" || enabled === "1"
        ? true
        : enabled === "false" || enabled === "0"
          ? false
          : base.remindersEnabled,
    reminderMedium: parseMedium(medium ?? undefined),
    reminderSmsWebhookUrl:
      webhook != null && webhook.trim() !== ""
        ? webhook.trim()
        : base.reminderSmsWebhookUrl,
    hasDbOverrides,
  };
}

export type CommunicationSettingsPatch = Partial<{
  reminderHoursBefore: number;
  reminderWindowHours: number;
  reminderPollIntervalMs: number;
  remindersEnabled: boolean;
  reminderMedium: ReminderMedium;
  reminderSmsWebhookUrl: string | null;
}>;

export async function updateCommunicationSettings(
  patch: CommunicationSettingsPatch
): Promise<CommunicationSettingsDto> {
  const db = getDb();
  const upserts: { key: string; value: string }[] = [];
  if (patch.reminderHoursBefore !== undefined) {
    upserts.push({
      key: COMMUNICATION_SETTING_KEYS.reminderHoursBefore,
      value: String(patch.reminderHoursBefore),
    });
  }
  if (patch.reminderWindowHours !== undefined) {
    upserts.push({
      key: COMMUNICATION_SETTING_KEYS.reminderWindowHours,
      value: String(patch.reminderWindowHours),
    });
  }
  if (patch.reminderPollIntervalMs !== undefined) {
    upserts.push({
      key: COMMUNICATION_SETTING_KEYS.reminderPollIntervalMs,
      value: String(patch.reminderPollIntervalMs),
    });
  }
  if (patch.remindersEnabled !== undefined) {
    upserts.push({
      key: COMMUNICATION_SETTING_KEYS.remindersEnabled,
      value: patch.remindersEnabled ? "true" : "false",
    });
  }
  if (patch.reminderMedium !== undefined) {
    upserts.push({
      key: COMMUNICATION_SETTING_KEYS.reminderMedium,
      value: patch.reminderMedium,
    });
  }
  if (patch.reminderSmsWebhookUrl !== undefined) {
    upserts.push({
      key: COMMUNICATION_SETTING_KEYS.reminderSmsWebhookUrl,
      value: patch.reminderSmsWebhookUrl?.trim() ?? "",
    });
  }

  for (const u of upserts) {
    await db
      .insert(appSettings)
      .values({
        key: u.key,
        value: u.value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: u.value, updatedAt: new Date() },
      });
  }

  return getCommunicationSettings();
}

export async function resetCommunicationSettingsToEnv(): Promise<void> {
  const db = getDb();
  await db.delete(appSettings);
}
