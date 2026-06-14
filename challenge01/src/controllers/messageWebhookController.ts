import { Request, Response, NextFunction } from "express";
import { storeIncomingMessage } from "../services/messageService.js";

export async function handleIncomingMessageWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await storeIncomingMessage(req.body);

    if (result.duplicate) {
      res.status(200).json({
        status: "duplicate_ignored",
        id: result.id,
        threadId: result.threadId,
        messageIndex: result.messageIndex
      });
      return;
    }

    res.status(202).json({
      status: "queued",
      id: result.id,
      threadId: result.threadId,
      messageIndex: result.messageIndex,
      remiMessage: result.remiMessage
    });
  } catch (error) {
    next(error);
  }
}
