import { Worker } from "bullmq";
import { redis } from "../config/redis";

export const sessionWorker = new Worker(
  "session-jobs",
  async (job) => {
    if (job.name === "session-ended") {
      console.log("Processing session end job:", job.data);
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
