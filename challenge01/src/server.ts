import { createServer } from "node:http";
import { createApp } from "./app.js";
import { prisma } from "./db/prisma.js";
import { startMessageWorker } from "./workers/messageWorker.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();
const server = createServer(app);
const worker = startMessageWorker();

server.listen(port, () => {
  console.log(`REMI message ingestor listening on http://localhost:${port}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}; shutting down`);
  worker.stop();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
