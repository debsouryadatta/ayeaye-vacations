import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import { createApp } from "../src/app.js";
import { MESSAGE_STATUS } from "../src/lib/domain/remiMessage.js";
import { prisma } from "../src/db/prisma.js";
import { ServiceStats } from "../src/services/statsService.js";
import { startMessageWorker } from "../src/workers/messageWorker.js";

interface MockParticipant {
  ParticipantSid: string;
  Identity?: string;
  Address?: string;
  ProjectedAddress?: string;
  Type: "SMS" | "CHAT";
  Role: "host" | "cleaner" | "vendor" | "cohost" | "guest" | "remi";
}

interface MockMessageInput {
  conversationSid: string;
  messagingServiceSid: string;
  messageSid: string;
  messageIndex: number;
  dateCreated: string;
  author: string;
  participantSid: string;
  body: string;
  participants: MockParticipant[];
  media?: Array<{
    Sid: string;
    Url: string;
    ContentType: string;
    Filename: string;
    Size?: number;
  }>;
  simulateWorkerFailureOnce?: boolean;
}

async function main(): Promise<void> {
  await resetDatabase();

  const app = createApp();
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const worker = startMessageWorker({ pollIntervalMs: 100, concurrency: 3, stabilizationWindowMs: 250 });

  try {
    console.log(`Simulation service started at ${baseUrl}`);

    const remiNumber = "+14155550100";
    const messagingServiceSid = "MGaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const propertyConversationSid = "CH11111111111111111111111111111111";
    const guestConversationSid = "CH22222222222222222222222222222222";
    const vendorConversationSid = "CH33333333333333333333333333333333";

    const propertyParticipants = participants({
      remiNumber,
      remiSid: "MB11111111111111111111111111111110",
      people: [
        ["MB11111111111111111111111111111111", "+14155550111", "host"],
        ["MB11111111111111111111111111111112", "+14155550112", "cleaner"],
        ["MB11111111111111111111111111111113", "+14155550113", "vendor"]
      ]
    });
    const guestParticipants = participants({
      remiNumber,
      remiSid: "MB22222222222222222222222222222220",
      people: [
        ["MB22222222222222222222222222222221", "+14155550111", "host"],
        ["MB22222222222222222222222222222222", "+14155550114", "cohost"],
        ["MB22222222222222222222222222222223", "+14155550116", "guest"]
      ]
    });
    const vendorParticipants = participants({
      remiNumber,
      remiSid: "MB33333333333333333333333333333330",
      people: [
        ["MB33333333333333333333333333333331", "+14155550111", "host"],
        ["MB33333333333333333333333333333332", "+14155550115", "vendor"],
        ["MB33333333333333333333333333333333", "+14155550117", "vendor"]
      ]
    });

    const propertyMessages = [
      buildTwilioWebhook({
        conversationSid: propertyConversationSid,
        messagingServiceSid,
        messageSid: "IM11111111111111111111111111111101",
        messageIndex: 0,
        dateCreated: "2026-06-14T09:00:00.000Z",
        author: "+14155550112",
        participantSid: "MB11111111111111111111111111111112",
        body: "Morning inspection at Mountain Muse: kitchen sink cabinet is wet and there is active dripping under the trap.",
        participants: propertyParticipants
      }),
      buildTwilioWebhook({
        conversationSid: propertyConversationSid,
        messagingServiceSid,
        messageSid: "IM11111111111111111111111111111102",
        messageIndex: 1,
        dateCreated: "2026-06-14T09:02:00.000Z",
        author: "+14155550111",
        participantSid: "MB11111111111111111111111111111111",
        body: "Please ask ABC Plumbing if they can inspect before the 3 PM guest check-in.",
        participants: propertyParticipants
      }),
      buildTwilioWebhook({
        conversationSid: propertyConversationSid,
        messagingServiceSid,
        messageSid: "IM11111111111111111111111111111103",
        messageIndex: 2,
        dateCreated: "2026-06-14T09:04:00.000Z",
        author: "+14155550113",
        participantSid: "MB11111111111111111111111111111113",
        body: "We can send Carlos between 11:30 and noon. Please keep the cabinet cleared.",
        participants: propertyParticipants
      })
    ];

    await postWebhook(baseUrl, propertyMessages[0]);
    await postWebhook(baseUrl, propertyMessages[2]);
    await postWebhook(baseUrl, propertyMessages[1]);
    console.log("Sent Mountain Muse messages with Twilio index 2 arriving before index 1.");

    await postWebhook(baseUrl, propertyMessages[1]);
    console.log("Sent duplicate IM...102 to prove idempotency.");

    await Promise.all([
      postWebhook(baseUrl, buildTwilioWebhook({
        conversationSid: guestConversationSid,
        messagingServiceSid,
        messageSid: "IM22222222222222222222222222222201",
        messageIndex: 0,
        dateCreated: "2026-06-14T09:05:00.000Z",
        author: "+14155550116",
        participantSid: "MB22222222222222222222222222222223",
        body: "Lake Escape guest says upstairs AC is blowing warm air and the thermostat shows 80 degrees.",
        participants: guestParticipants
      })),
      postWebhook(baseUrl, buildTwilioWebhook({
        conversationSid: vendorConversationSid,
        messagingServiceSid,
        messageSid: "IM33333333333333333333333333333301",
        messageIndex: 0,
        dateCreated: "2026-06-14T09:05:30.000Z",
        author: "+14155550115",
        participantSid: "MB33333333333333333333333333333332",
        body: "Cine Lodge breaker panel label is outdated. I need approval for one extra hour to trace the kitchen circuit.",
        participants: vendorParticipants
      })),
      postWebhook(baseUrl, buildTwilioWebhook({
        conversationSid: guestConversationSid,
        messagingServiceSid,
        messageSid: "IM22222222222222222222222222222202",
        messageIndex: 1,
        dateCreated: "2026-06-14T09:06:00.000Z",
        author: "+14155550114",
        participantSid: "MB22222222222222222222222222222222",
        body: "I offered the guest a portable fan and will check if maintenance can arrive today.",
        participants: guestParticipants
      }))
    ]);

    console.log("Sent multiple Twilio Conversations concurrently.");

    await postWebhook(baseUrl, buildTwilioWebhook({
      conversationSid: propertyConversationSid,
      messagingServiceSid,
      messageSid: "IM11111111111111111111111111111104",
      messageIndex: 3,
      dateCreated: "2026-06-14T09:07:00.000Z",
      author: "+14155550112",
      participantSid: "MB11111111111111111111111111111112",
      body: "Photo attached. Water is pooling on the left side of the cabinet floor.",
      participants: propertyParticipants,
      media: [
        {
          Sid: "ME11111111111111111111111111111104",
          Url: `${baseUrl}/mock-media/mountain-muse-sink-leak.jpg`,
          ContentType: "image/jpeg",
          Filename: "mountain-muse-sink-leak.jpg",
          Size: 37_421
        }
      ]
    }));

    console.log("Sent media message with a local mock Twilio temporary media URL.");

    await postWebhook(baseUrl, buildTwilioWebhook({
      conversationSid: vendorConversationSid,
      messagingServiceSid,
      messageSid: "IM33333333333333333333333333333302",
      messageIndex: 1,
      dateCreated: "2026-06-14T09:08:00.000Z",
      author: "+14155550117",
      participantSid: "MB33333333333333333333333333333333",
      body: "This message intentionally fails once so the worker retry path is visible.",
      participants: vendorParticipants,
      simulateWorkerFailureOnce: true
    }));

    console.log("Sent transient failure message.");

    await worker.drain(15_000);

    const statsResponse = await fetch(`${baseUrl}/stats`);
    const stats = await statsResponse.json() as ServiceStats;
    const messages = await prisma.message.findMany({
      orderBy: [
        { conversationSid: "asc" },
        { twilioMessageIndex: "asc" }
      ],
      select: {
        providerMessageId: true,
        conversationSid: true,
        twilioMessageIndex: true,
        status: true,
        attempts: true,
        normalizedMessageJson: true
      }
    });

    assert(stats.messagesReceived === 9, `Expected 9 received webhook events including duplicate, got ${stats.messagesReceived}`);
    assert(stats.duplicatesIgnored === 1, `Expected 1 duplicate ignored, got ${stats.duplicatesIgnored}`);
    assert(stats.messagesProcessed === 8, `Expected 8 processed unique messages, got ${stats.messagesProcessed}`);
    assert(stats.failedMessages === 0, `Expected 0 failed messages, got ${stats.failedMessages}`);
    assert(stats.pendingQueueDepth === 0, `Expected empty queue, got ${stats.pendingQueueDepth}`);
    assert(messages.every((message) => message.status === MESSAGE_STATUS.processed), "Every unique message should be processed.");

    const failureMessage = messages.find((message) => message.providerMessageId === "IM33333333333333333333333333333302");
    assert(failureMessage?.attempts === 2, `Failure simulation should succeed on second attempt, got ${failureMessage?.attempts}`);

    const mediaMessage = messages.find((message) => message.providerMessageId === "IM11111111111111111111111111111104");
    assert(Boolean(mediaMessage), "Media message should exist.");
    const normalizedMediaMessage = JSON.parse(mediaMessage!.normalizedMessageJson);
    assert(
      normalizedMediaMessage.mediaAttachments[0] === "https://mock-s3.remi.local/IM11111111111111111111111111111104-ME11111111111111111111111111111104.jpg",
      "Media message should expose mock stored URL."
    );
    assert(
      normalizedMediaMessage.metadata.media[0].localPath === "/tmp/remi-media/IM11111111111111111111111111111104-ME11111111111111111111111111111104.jpg",
      "Worker should download media to /tmp/remi-media."
    );

    const propertyConversationRows = messages.filter((message) => message.conversationSid === propertyConversationSid);
    assert(
      propertyConversationRows.map((message) => message.twilioMessageIndex).join(",") === "0,1,2,3",
      `Property conversation should preserve Twilio indexes 0,1,2,3, got ${propertyConversationRows.map((message) => message.twilioMessageIndex).join(",")}`
    );

    assertConversationExists(messages, guestConversationSid);
    assertConversationExists(messages, vendorConversationSid);

    console.log("\nSimulation passed.");
    console.log(JSON.stringify(stats, null, 2));
  } finally {
    worker.stop();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  }
}

function participants(input: {
  remiNumber: string;
  remiSid: string;
  people: Array<[participantSid: string, phoneNumber: string, role: MockParticipant["Role"]]>;
}): MockParticipant[] {
  return [
    {
      ParticipantSid: input.remiSid,
      Identity: "remi",
      ProjectedAddress: input.remiNumber,
      Type: "CHAT",
      Role: "remi"
    },
    ...input.people.map(([participantSid, phoneNumber, role]) => ({
      ParticipantSid: participantSid,
      Address: phoneNumber,
      Type: "SMS" as const,
      Role: role
    }))
  ];
}

function buildTwilioWebhook(input: MockMessageInput) {
  return {
    EventType: "onMessageAdded",
    ConversationSid: input.conversationSid,
    MessageSid: input.messageSid,
    MessagingServiceSid: input.messagingServiceSid,
    Index: input.messageIndex,
    DateCreated: input.dateCreated,
    Body: input.body,
    Author: input.author,
    ParticipantSid: input.participantSid,
    Attributes: JSON.stringify({
      simulateWorkerFailureOnce: input.simulateWorkerFailureOnce === true
    }),
    Media: input.media ? JSON.stringify(input.media) : undefined,
    ParticipantSnapshot: JSON.stringify(input.participants)
  };
}

async function postWebhook(baseUrl: string, payload: unknown): Promise<void> {
  const response = await fetch(`${baseUrl}/webhook/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Webhook request failed with ${response.status}: ${body}`);
  }
}

async function resetDatabase(): Promise<void> {
  await prisma.message.deleteMany();
  await prisma.metric.deleteMany();
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertConversationExists(messages: Array<{ conversationSid: string }>, conversationSid: string): void {
  assert(
    messages.some((message) => message.conversationSid === conversationSid),
    `Expected conversation ${conversationSid}`
  );
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
