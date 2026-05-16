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
  //1.Check if User exists with userId
  const user = await SessionRepository.findById(userId);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  //2.Then with repository create the session

  const startTime = new Date();

  const session = await SessionRepository.createSession({
    userId,
    title,
    startTime,
    endTime: null,
    durationMin: null,
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
