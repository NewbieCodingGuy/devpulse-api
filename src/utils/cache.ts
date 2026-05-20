import { redis } from "../config/redis";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  async set(key: string, value: unknown, ttlSecond: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttlSecond);
  },

  async deletePattern(pattern: string): Promise<void> {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  },
};
