import { Express, Request, Response } from "express";
import { handleIncomingMessageWebhook } from "../controllers/messageWebhookController.js";
import { handleHealth, handleStats } from "../controllers/observabilityController.js";

export function registerRoutes(app: Express): void {
  app.get("/health", handleHealth);
  app.get("/stats", handleStats);

  app.get("/mock-media/:fileName", (req: Request, res: Response) => {
    const fileName = String(req.params.fileName ?? "mock-media.bin");
    const contentType = contentTypeForFile(fileName);
    res.setHeader("content-type", contentType);
    res.send(Buffer.from(`mock media bytes for ${fileName}\n`, "utf8"));
  });

  app.post("/webhook/messages", handleIncomingMessageWebhook);
}

function contentTypeForFile(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
