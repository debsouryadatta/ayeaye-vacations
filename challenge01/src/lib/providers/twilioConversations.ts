import { z } from "zod";
import { RemiMediaAttachment, RemiMessage } from "../domain/remiMessage.js";

const mediaSchema = z.object({
  Sid: z.string().optional(),
  sid: z.string().optional(),
  ContentType: z.string().optional(),
  content_type: z.string().optional(),
  Filename: z.string().optional(),
  filename: z.string().optional(),
  Size: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  Url: z.string().url().optional(),
  url: z.string().url().optional()
}).passthrough();

const participantSnapshotSchema = z.object({
  ParticipantSid: z.string().optional(),
  participantSid: z.string().optional(),
  Identity: z.string().nullable().optional(),
  identity: z.string().nullable().optional(),
  Address: z.string().optional(),
  address: z.string().optional(),
  ProxyAddress: z.string().optional(),
  proxyAddress: z.string().optional(),
  ProjectedAddress: z.string().optional(),
  projectedAddress: z.string().optional(),
  Type: z.string().optional(),
  type: z.string().optional(),
  Role: z.string().optional(),
  role: z.string().optional()
}).passthrough();

const twilioConversationMessageWebhookSchema = z.object({
  EventType: z.literal("onMessageAdded"),
  ConversationSid: z.string(),
  MessageSid: z.string(),
  MessagingServiceSid: z.string().optional(),
  Index: z.coerce.number().int().nonnegative(),
  DateCreated: z.string(),
  Body: z.string().default(""),
  Author: z.string().default(""),
  ParticipantSid: z.string().optional(),
  Attributes: z.union([z.string(), z.record(z.unknown())]).optional(),
  Media: z.union([z.string(), z.array(mediaSchema)]).optional(),

  // Test harness field. In production this data comes from
  // GET /Conversations/{ConversationSid}/Participants.
  ParticipantSnapshot: z.union([z.string(), z.array(participantSnapshotSchema)]).optional()
}).passthrough();

export type TwilioConversationMessageWebhook = z.infer<typeof twilioConversationMessageWebhookSchema>;
type ParticipantSnapshot = z.infer<typeof participantSnapshotSchema>;

export function parseTwilioConversationWebhook(input: unknown): TwilioConversationMessageWebhook {
  return twilioConversationMessageWebhookSchema.parse(input);
}

export function normalizeTwilioConversationWebhook(input: unknown, receivedAt = Date.now()): RemiMessage {
  const webhook = parseTwilioConversationWebhook(input);
  const participants = parseParticipantSnapshot(webhook.ParticipantSnapshot);
  const senderPhoneNumber = findSenderPhoneNumber(webhook, participants);
  const participantPhoneNumbers = uniquePhoneNumbers([
    ...participants.flatMap(phoneNumbersFromParticipant),
    senderPhoneNumber
  ]);
  const media = parseMedia(webhook.Media).map((attachment, index): RemiMediaAttachment => {
    const providerMediaId = attachment.Sid ?? attachment.sid ?? `${webhook.MessageSid}-media-${index + 1}`;
    const contentType = attachment.ContentType ?? attachment.content_type;
    const sourceUrl = attachment.Url ?? attachment.url;

    if (!sourceUrl) {
      throw new Error(`Mock Twilio media ${providerMediaId} is missing Url. Production would request a temporary URL from Twilio Media API.`);
    }

    return {
      providerMediaId,
      sourceUrl,
      storedUrl: buildMockStoredMediaUrl(webhook.MessageSid, providerMediaId, index, contentType, sourceUrl),
      contentType,
      fileName: attachment.Filename ?? attachment.filename,
      size: attachment.Size ?? attachment.size
    };
  });
  const attributes = parseJsonObject(webhook.Attributes);
  const timestamp = Date.parse(webhook.DateCreated);

  return {
    provider: "twilio-conversations",
    providerMessageId: webhook.MessageSid,
    groupId: webhook.ConversationSid,
    threadId: webhook.ConversationSid,
    senderPhoneNumber,
    participantPhoneNumbers,
    timestamp,
    textBody: webhook.Body,
    mediaAttachments: media.map((attachment) => attachment.storedUrl),
    rawPayloadReference: {
      providerEventId: webhook.EventType,
      providerMessageId: webhook.MessageSid,
      storage: "sqlite.messages.rawPayloadJson"
    },
    receivedAt,
    metadata: {
      providerType: "conversation-message",
      direction: "inbound",
      media,
      simulateWorkerFailureOnce: attributes.simulateWorkerFailureOnce === true,
      twilio: {
        conversationSid: webhook.ConversationSid,
        messageSid: webhook.MessageSid,
        messagingServiceSid: webhook.MessagingServiceSid,
        messageIndex: webhook.Index,
        participantSid: webhook.ParticipantSid,
        author: webhook.Author,
        participantSnapshotSource: participants.length > 0 ? "mock-webhook" : "unavailable"
      }
    }
  };
}

export function buildMockStoredMediaUrl(
  messageSid: string,
  providerMediaId: string,
  index: number,
  contentType: string | undefined,
  sourceUrl: string
): string {
  const extension = extensionFromContentType(contentType) ?? extensionFromUrl(sourceUrl) ?? "bin";
  const safeMessageSid = messageSid.replace(/[^a-zA-Z0-9_-]/g, "-");
  const safeMediaId = providerMediaId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `https://mock-s3.remi.local/${safeMessageSid}-${safeMediaId || index + 1}.${extension}`;
}

function parseParticipantSnapshot(input: TwilioConversationMessageWebhook["ParticipantSnapshot"]): ParticipantSnapshot[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  try {
    const parsed = JSON.parse(input);
    const result = z.array(participantSnapshotSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function parseMedia(input: TwilioConversationMessageWebhook["Media"]): z.infer<typeof mediaSchema>[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  try {
    const parsed = JSON.parse(input);
    const result = z.array(mediaSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function parseJsonObject(input: TwilioConversationMessageWebhook["Attributes"]): Record<string, unknown> {
  if (!input) return {};
  if (typeof input !== "string") return input;

  try {
    const parsed = JSON.parse(input);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function findSenderPhoneNumber(webhook: TwilioConversationMessageWebhook, participants: ParticipantSnapshot[]): string {
  const participant = participants.find((candidate) => {
    const participantSid = candidate.ParticipantSid ?? candidate.participantSid;
    return participantSid && participantSid === webhook.ParticipantSid;
  });

  if (participant) {
    const [phoneNumber] = phoneNumbersFromParticipant(participant);
    if (phoneNumber) return phoneNumber;
  }

  return looksLikePhoneNumber(webhook.Author) ? webhook.Author : `participant:${webhook.ParticipantSid ?? webhook.Author}`;
}

function phoneNumbersFromParticipant(participant: ParticipantSnapshot): string[] {
  return [
    participant.Address ?? participant.address,
    participant.ProjectedAddress ?? participant.projectedAddress,
    participant.ProxyAddress ?? participant.proxyAddress
  ].filter((value): value is string => Boolean(value && looksLikePhoneNumber(value)));
}

function uniquePhoneNumbers(phoneNumbers: string[]): string[] {
  return [...new Set(phoneNumbers.filter(looksLikePhoneNumber))].sort();
}

function looksLikePhoneNumber(value: string | undefined): value is string {
  return Boolean(value && /^\+\d{7,15}$/.test(value));
}

function extensionFromContentType(contentType: string | undefined): string | undefined {
  if (!contentType) return undefined;

  const normalized = contentType.toLowerCase();
  if (normalized.includes("jpeg")) return "jpg";
  if (normalized.includes("png")) return "png";
  if (normalized.includes("gif")) return "gif";
  if (normalized.includes("pdf")) return "pdf";
  if (normalized.includes("mp4")) return "mp4";
  if (normalized.includes("plain")) return "txt";
  return undefined;
}

function extensionFromUrl(sourceUrl: string): string | undefined {
  try {
    const pathname = new URL(sourceUrl).pathname;
    const extension = pathname.split(".").pop();
    return extension && extension.length <= 8 ? extension : undefined;
  } catch {
    return undefined;
  }
}
