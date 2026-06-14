import { MESSAGE_STATUS } from "../lib/domain/remiMessage.js";
import { METRICS, getMetricValue } from "../db/metrics.js";
import { prisma } from "../db/prisma.js";

export interface ServiceStats {
  messagesReceived: number;
  messagesProcessed: number;
  duplicatesIgnored: number;
  failedMessages: number;
  pendingQueueDepth: number;
  queuedMessages: number;
  processingMessages: number;
}

export async function getServiceStats(): Promise<ServiceStats> {
  const [
    messagesReceived,
    messagesProcessed,
    duplicatesIgnored,
    failedMessages,
    queuedMessages,
    processingMessages
  ] = await Promise.all([
    getMetricValue(METRICS.messagesReceived),
    getMetricValue(METRICS.messagesProcessed),
    getMetricValue(METRICS.duplicatesIgnored),
    prisma.message.count({ where: { status: MESSAGE_STATUS.failed } }),
    prisma.message.count({ where: { status: MESSAGE_STATUS.queued } }),
    prisma.message.count({ where: { status: MESSAGE_STATUS.processing } })
  ]);

  return {
    messagesReceived,
    messagesProcessed,
    duplicatesIgnored,
    failedMessages,
    pendingQueueDepth: queuedMessages + processingMessages,
    queuedMessages,
    processingMessages
  };
}
