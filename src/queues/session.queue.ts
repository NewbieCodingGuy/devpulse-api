import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const sessionQueue = new Queue("session-jobs", {
  connection: redis,
});
