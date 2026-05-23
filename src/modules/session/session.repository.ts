import { AppDataSource } from "../../config/database";
import { User } from "../../entities/User";
import { Session } from "../../entities/Session";

export const SessionRepository = {
  async createSession(data: {
    userId: string;
    title: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
    language: string;
    notes: string | null;
  }): Promise<Session> {
    const repo = AppDataSource.getRepository(Session);
    const session = repo.create(data);

    return repo.save(session);
  },

  async findSessionsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ sessions: Session[]; total: number }> {
    const [sessions, total] = await AppDataSource.getRepository(
      Session,
    ).findAndCount({
      where: { userId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { sessions, total };
  },

  async findByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<Session | null> {
    return AppDataSource.getRepository(Session).findOne({
      where: { id: sessionId, userId },
    });
  },

  async updateSession(session: Session): Promise<Session> {
    return AppDataSource.getRepository(Session).save(session);
  },

  async deleteSession(session: Session): Promise<void> {
    await AppDataSource.getRepository(Session).remove(session);
  },

  async updateAiSummary(sessionId: string, summary: string): Promise<void> {
    await AppDataSource.getRepository(Session).update(
      { id: sessionId },
      { aiSummary: summary },
    );
  },
};
