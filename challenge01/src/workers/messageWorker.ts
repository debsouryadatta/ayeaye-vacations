import { Message } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { METRICS, incrementMetric } from "../db/metrics.js";
import { MESSAGE_STATUS, RemiMessage } from "../lib/domain/remiMessage.js";
import { downloadAndStoreMedia } from "../lib/media/mediaStorage.js";

interface MessageWorkerOptions {
  pollIntervalMs?: number;
  concurrency?: number;
  stabilizationWindowMs?: number;
}

export interface MessageWorkerHandle {
  stop: () => void;
  drain: (timeoutMs?: number) => Promise<void>;
}

export function startMessageWorker(options: MessageWorkerOptions = {}): MessageWorkerHandle {
  const worker = new MessageWorker(options);
  void worker.start();
  return {
    stop: () => worker.stop(),
    drain: (timeoutMs?: number) => worker.drain(timeoutMs)
  };
}

class MessageWorker {
  private readonly pollIntervalMs: number;
  private readonly concurrency: number;
  private readonly stabilizationWindowMs: number;
  private readonly activeThreads = new Set<string>();
  private interval: NodeJS.Timeout | undefined;
  private ticking = false;
  private inFlight = 0;
  private stopped = false;

  constructor(options: MessageWorkerOptions) {
    this.pollIntervalMs = options.pollIntervalMs ?? 300;
    this.concurrency = options.concurrency ?? 3;
    this.stabilizationWindowMs = options.stabilizationWindowMs ?? 500;
  }

  async start(): Promise<void> {
    await recoverInterruptedJobs();
    this.interval = setInterval(() => {
      void this.tick();
    }, this.pollIntervalMs);
    void this.tick();
  }

  stop(): void {
    this.stopped = true;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async drain(timeoutMs = 10_000): Promise<void> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      await this.tick();
      const pending = await prisma.message.count({
        where: {
          status: {
            in: [MESSAGE_STATUS.queued, MESSAGE_STATUS.processing]
          }
        }
      });

      if (pending === 0 && this.inFlight === 0) {
        return;
      }

      await sleep(100);
    }

    throw new Error(`Worker did not drain within ${timeoutMs}ms`);
  }

  private async tick(): Promise<void> {
    if (this.ticking || this.stopped) return;
    this.ticking = true;

    try {
      while (this.inFlight < this.concurrency && !this.stopped) {
        const job = await this.claimNextJob();
        if (!job) break;

        this.inFlight += 1;
        void this.processJob(job).finally(() => {
          this.inFlight -= 1;
          this.activeThreads.delete(job.threadId);
        });
      }
    } finally {
      this.ticking = false;
    }
  }

  private async claimNextJob(): Promise<Message | null> {
    const candidates = await prisma.message.findMany({
      where: {
        status: MESSAGE_STATUS.queued,
        receivedAt: {
          lte: new Date(Date.now() - this.stabilizationWindowMs)
        }
      },
      orderBy: [
        { conversationSid: "asc" },
        { twilioMessageIndex: "asc" },
        { providerTimestamp: "asc" },
        { receivedAt: "asc" }
      ],
      take: 50
    });

    for (const candidate of candidates) {
      if (this.activeThreads.has(candidate.threadId)) {
        continue;
      }

      const olderBlockingJob = await prisma.message.findFirst({
        where: {
          conversationSid: candidate.conversationSid,
          twilioMessageIndex: { lt: candidate.twilioMessageIndex },
          status: {
            in: [MESSAGE_STATUS.queued, MESSAGE_STATUS.processing]
          }
        },
        select: { id: true }
      });

      if (olderBlockingJob) {
        continue;
      }

      const updated = await prisma.message.updateMany({
        where: {
          id: candidate.id,
          status: MESSAGE_STATUS.queued
        },
        data: {
          status: MESSAGE_STATUS.processing,
          attempts: { increment: 1 },
          processingStartedAt: new Date()
        }
      });

      if (updated.count === 0) {
        continue;
      }

      const claimed = await prisma.message.findUniqueOrThrow({ where: { id: candidate.id } });
      this.activeThreads.add(claimed.threadId);
      return claimed;
    }

    return null;
  }

  private async processJob(job: Message): Promise<void> {
    try {
      const remiMessage = JSON.parse(job.normalizedMessageJson) as RemiMessage;

      if (remiMessage.metadata.simulateWorkerFailureOnce && job.attempts === 1) {
        throw new Error("Simulated transient worker failure for retry demonstration");
      }

      const downloadedMedia = await downloadAndStoreMedia(remiMessage.metadata.media);
      const finalMessage: RemiMessage = {
        ...remiMessage,
        mediaAttachments: downloadedMedia.map((attachment) => attachment.storedUrl),
        metadata: {
          ...remiMessage.metadata,
          media: downloadedMedia
        }
      };

      console.log("Final RemiMessage");
      console.log(JSON.stringify(finalMessage, null, 2));

      await prisma.message.update({
        where: { id: job.id },
        data: {
          status: MESSAGE_STATUS.processed,
          normalizedMessageJson: JSON.stringify(finalMessage),
          processedAt: new Date(),
          lastError: null
        }
      });
      await incrementMetric(METRICS.messagesProcessed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failedPermanently = job.attempts >= job.maxAttempts;

      await prisma.message.update({
        where: { id: job.id },
        data: {
          status: failedPermanently ? MESSAGE_STATUS.failed : MESSAGE_STATUS.queued,
          lastError: message,
          processingStartedAt: null
        }
      });
    }
  }
}

async function recoverInterruptedJobs(): Promise<void> {
  await prisma.message.updateMany({
    where: { status: MESSAGE_STATUS.processing },
    data: {
      status: MESSAGE_STATUS.queued,
      processingStartedAt: null,
      lastError: "Recovered from interrupted processing state"
    }
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
