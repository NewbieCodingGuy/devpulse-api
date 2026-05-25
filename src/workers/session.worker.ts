import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { generateSessionSummary } from "../services/openai.service";
import { SessionRepository } from "../modules/session/session.repository";
import { getIO } from "../config/socket";

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

      const io = getIO();
      io.to(job.data.userId).emit("session:summary-ready", {
        sessionId: job.data.sessionId,
        aiSummary: summaryResult,
      });
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
