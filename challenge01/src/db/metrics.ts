import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma.js";

type PrismaTransaction = Prisma.TransactionClient;

export const METRICS = {
  messagesReceived: "messages_received",
  duplicatesIgnored: "duplicates_ignored",
  messagesProcessed: "messages_processed"
} as const;

export async function incrementMetric(
  key: string,
  by = 1,
  client: PrismaClient | PrismaTransaction = prisma
): Promise<void> {
  await client.metric.upsert({
    where: { key },
    create: { key, value: by },
    update: { value: { increment: by } }
  });
}

export async function getMetricValue(key: string): Promise<number> {
  const metric = await prisma.metric.findUnique({ where: { key } });
  return metric?.value ?? 0;
}
