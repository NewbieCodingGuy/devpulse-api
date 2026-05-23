import { SessionRepository } from "./session.repository";
import { AppError } from "../../utils/AppError";
import { UserSession, SessionListResult } from "../../types/session.types";
import { cache } from "../../utils/cache";
import { sessionQueue } from "../../queues/session.queue";
import { tryCatch } from "bullmq";

export const createSession = async ({
  userId,
  title,
  language,
  notes,
}: {
  userId: string;
  title: string;
  language: string;
  notes: string | null;
}): Promise<{ userSession: UserSession }> => {
  const startTime = new Date();

  const session = await SessionRepository.createSession({
    userId,
    title,
    startTime,
    endTime: null,
    duration: null,
    language,
    notes,
  });

  //3. Pack it into UserSession and return
  const uSession: UserSession = {
    id: session.id,
    userId: session.userId,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMin: session.duration,
    language: session.language,
    title: session.title,
    notes: session.notes,
  };

  //Invalidate caching
  try {
    await cache.deletePattern(`sessions:${userId}:*`);
    console.log("Cache Deleting");
  } catch (error) {
    console.log("Cache deletion failed : ", error);
  }

  return {
    userSession: uSession,
  };
};

export const getAllSession = async ({
  userId,
  page,
  limit,
}: {
  userId: string;
  page: number;
  limit: number;
}): Promise<{
  allSessions: UserSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const cacheKey = `sessions:${userId}:page:${safePage}:limit:${safeLimit}`;

  try {
    const cached = await cache.get<SessionListResult>(cacheKey);
    console.log("Cache hitting!");
    if (cached) return cached;
  } catch (error) {
    console.log("Caching read failed ", error);
  }

  const { sessions, total } = await SessionRepository.findSessionsByUserId(
    userId,
    safePage,
    safeLimit,
  );

  const _allSessions: UserSession[] = sessions.map((session) => ({
    id: session.id,
    userId: session.userId,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMin: session.duration,
    language: session.language,
    notes: session.notes,
  }));

  const totalPages = Math.ceil(total / safeLimit);
  const hasNext = safePage < totalPages;
  const hasPrev = safePage > 1;

  const result = {
    allSessions: _allSessions,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };

  try {
    await cache.set(cacheKey, result, 300);
    console.log("Cache writing");
  } catch (error) {
    console.log("Cache write failed ", error);
  }

  return result;
};

export const getSessionByID = async ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Promise<{ sessionData: UserSession }> => {
  const cacheKey = `sessions:${userId}:${sessionId}`;

  try {
    const cached = await cache.get<{ sessionData: UserSession }>(cacheKey);
    console.log("Cache reading");
    if (cached) return cached;
  } catch (error) {
    console.log("Cache read failed : ", error);
  }

  const session = await SessionRepository.findByIdAndUserId(sessionId, userId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const _session: UserSession = {
    id: session.id,
    userId: session.userId,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMin: session.duration,
    language: session.language,
    notes: session.notes,
  };

  const returnValue = { sessionData: _session };
  try {
    await cache.set(cacheKey, returnValue, 300);
    console.log("Cache writing");
  } catch (error) {
    console.log("Cache Writing Failed ", error);
  }

  return {
    sessionData: _session,
  };
};

export const updateSession = async ({
  userId,
  sessionId,
  title,
  endTime,
  language,
  notes,
}: {
  userId: string;
  sessionId: string;
  title?: string;
  endTime?: Date | null;
  language?: string;
  notes?: string | null;
}): Promise<{ sessionData: UserSession }> => {
  const session = await SessionRepository.findByIdAndUserId(sessionId, userId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (title !== undefined) {
    session.title = title;
  }

  if (language !== undefined) {
    session.language = language;
  }

  if (notes !== undefined) {
    session.notes = notes;
  }

  if (endTime !== undefined) {
    if (endTime !== null && endTime <= session.startTime) {
      throw new AppError("endTime must be after startTime", 400);
    }

    session.endTime = endTime;

    if (endTime !== null) {
      const diffMs = endTime.getTime() - session.startTime.getTime();
      session.duration = Math.round(diffMs / 60000);
    }
  }

  const updatedSession = await SessionRepository.updateSession(session);

  const sessionData: UserSession = {
    id: updatedSession.id,
    userId: updatedSession.userId,
    title: updatedSession.title,
    startTime: updatedSession.startTime,
    endTime: updatedSession.endTime,
    durationMin: updatedSession.duration,
    language: updatedSession.language,
    notes: updatedSession.notes,
  };

  if (endTime !== null && endTime !== undefined) {
    try {
      await sessionQueue.add(
        "session-ended",
        {
          sessionId: updatedSession.id,
          userId: updatedSession.userId,
          title: updatedSession.title,
          duration: updatedSession.duration,
          language: updatedSession.language,
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      );
    } catch (error) {
      console.error("Failed to queue session-ended job:", error);
    }
  }

  try {
    await cache.deletePattern(`sessions:${userId}:*`);
    console.log("Cache Deleting");
  } catch (error) {
    console.log("Cache Deletion failed ", error);
  }

  return {
    sessionData,
  };
};

export const deleteSession = async ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Promise<void> => {
  const session = await SessionRepository.findByIdAndUserId(sessionId, userId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  await SessionRepository.deleteSession(session);

  try {
    await cache.deletePattern(`sessions:${userId}:*`);
    console.log("Cache Deleting");
  } catch (error) {
    console.log("Cache Deletion Failed ", error);
  }
};
