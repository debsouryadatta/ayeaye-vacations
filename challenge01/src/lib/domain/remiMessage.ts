export interface RemiMediaAttachment {
  sourceUrl: string;
  storedUrl: string;
  providerMediaId?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  sha256?: string;
  localPath?: string;
  downloadedAt?: number;
}

export interface RemiMessage {
  provider: string;
  providerMessageId: string;
  groupId: string;
  threadId: string;
  senderPhoneNumber: string;
  participantPhoneNumbers: string[];
  timestamp: number;
  textBody: string;
  mediaAttachments: string[];
  rawPayloadReference: {
    providerEventId?: string;
    providerMessageId: string;
    storage: "sqlite.messages.rawPayloadJson";
  };
  receivedAt: number;
  metadata: {
    providerType?: string;
    direction?: string;
    encoding?: string;
    twilio?: {
      conversationSid: string;
      messageSid: string;
      messagingServiceSid?: string;
      messageIndex: number;
      participantSid?: string;
      author?: string;
      participantSnapshotSource: "mock-webhook" | "twilio-api" | "unavailable";
    };
    media: RemiMediaAttachment[];
    simulateWorkerFailureOnce?: boolean;
  };
}

export const MESSAGE_STATUS = {
  queued: "QUEUED",
  processing: "PROCESSING",
  processed: "PROCESSED",
  failed: "FAILED"
} as const;

export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];
