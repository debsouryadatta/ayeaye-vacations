import express, { Request, Response } from "express";
import { ZodError } from "zod";
import { registerRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  registerRoutes(app);

  app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Invalid Twilio Conversations onMessageAdded webhook payload",
        details: error.errors.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      error: "Internal server error"
    });
  });

  return app;
}
