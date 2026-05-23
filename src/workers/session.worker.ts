import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { generateSessionSummary } from "../services/openai.service";
import { SessionRepository } from "../modules/session/session.repository";
import { AppError } from "../utils/AppError";

export const sessionWorker = new Worker(
  "session-jobs",
  async (job) => {
    if (job.name === "session-ended") {
      console.log("Processing session end job:", job.data);

      const summaryResult = await generateSessionSummary(job.data);

      await SessionRepository.updateAiSummary(
        job.data.sessionId,
        summaryResult,
      );
    }
  },
  {
    connection: redis,
  },
);

sessionWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

sessionWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
