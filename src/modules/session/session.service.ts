import { SessionRepository } from "./session.repository";
import { AppError } from "../../utils/AppError";
import { UserSession } from "../../types/session.types";

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

  const { sessions, total } = await SessionRepository.findSessionsByUserId(
    userId,
    safePage,
    safeLimit,
  );

  if (sessions === null || sessions === undefined || sessions.length === 0) {
    return {
      allSessions: [],
      pagination: {
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

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

  return {
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
};

export const getSessionByID = async ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Promise<{ sessionData: UserSession }> => {
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
};
