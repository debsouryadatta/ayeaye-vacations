import { Request, Response, NextFunction } from "express";
import { getServiceStats } from "../services/statsService.js";

export function handleHealth(_req: Request, res: Response): void {
  res.json({
    status: "ok",
    service: "remi-message-ingestor",
    timestamp: Date.now()
  });
}

export async function handleStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getServiceStats());
  } catch (error) {
    next(error);
  }
}
