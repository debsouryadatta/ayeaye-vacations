import { Prisma } from "@prisma/client";
import { MESSAGE_STATUS, RemiMessage } from "../lib/domain/remiMessage.js";
import { METRICS, incrementMetric } from "../db/metrics.js";
import { prisma } from "../db/prisma.js";
import { normalizeTwilioConversationWebhook } from "../lib/providers/twilioConversations.js";

export interface StoreIncomingMessageResult {
  duplicate: boolean;
  id?: string;
  messageIndex?: number;
  threadId?: string;
  remiMessage?: RemiMessage;
}

export async function storeIncomingMessage(rawPayload: unknown): Promise<StoreIncomingMessageResult> {
  const receivedAt = Date.now();
  const remiMessage = normalizeTwilioConversationWebhook(rawPayload, receivedAt);
  const twilio = remiMessage.metadata.twilio;

  if (!twilio) {
    throw new Error("Twilio metadata is required for Twilio Conversations messages");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await incrementMetric(METRICS.messagesReceived, 1, tx);

      const existing = await tx.message.findUnique({
        where: {
          provider_providerMessageId: {
            provider: remiMessage.provider,
            providerMessageId: remiMessage.providerMessageId
          }
        },
        select: {
          id: true,
          threadId: true,
          twilioMessageIndex: true
        }
      });

      if (existing) {
        await incrementMetric(METRICS.duplicatesIgnored, 1, tx);
        return {
          duplicate: true,
          id: existing.id,
          messageIndex: existing.twilioMessageIndex,
          threadId: existing.threadId
        };
      }

      const created = await tx.message.create({
        data: {
          provider: remiMessage.provider,
          providerMessageId: remiMessage.providerMessageId,
          providerEventType: remiMessage.rawPayloadReference.providerEventId ?? null,
          conversationSid: twilio.conversationSid,
          messagingServiceSid: twilio.messagingServiceSid ?? null,
          twilioMessageIndex: twilio.messageIndex,
          author: twilio.author ?? null,
          participantSid: twilio.participantSid ?? null,
          threadId: remiMessage.threadId,
          groupId: remiMessage.groupId,
          status: MESSAGE_STATUS.queued,
          rawPayloadJson: JSON.stringify(rawPayload),
          normalizedMessageJson: JSON.stringify(remiMessage),
          providerTimestamp: new Date(remiMessage.timestamp),
          receivedAt: new Date(remiMessage.receivedAt)
        }
      });

      return {
        duplicate: false,
        id: created.id,
        messageIndex: created.twilioMessageIndex,
        threadId: remiMessage.threadId,
        remiMessage
      };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return handleDuplicateRace(remiMessage);
    }

    throw error;
  }
}

async function handleDuplicateRace(remiMessage: RemiMessage): Promise<StoreIncomingMessageResult> {
  await incrementMetric(METRICS.duplicatesIgnored);
  const existing = await prisma.message.findUniqueOrThrow({
    where: {
      provider_providerMessageId: {
        provider: remiMessage.provider,
        providerMessageId: remiMessage.providerMessageId
      }
    },
    select: {
      id: true,
      threadId: true,
      twilioMessageIndex: true
    }
  });

  return {
    duplicate: true,
    id: existing.id,
    messageIndex: existing.twilioMessageIndex,
    threadId: existing.threadId
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
