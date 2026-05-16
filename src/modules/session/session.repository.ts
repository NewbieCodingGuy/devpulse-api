import { AppDataSource } from "../../config/database";
import { User } from "../../entities/User";
import { Session } from "../../entities/Session";

export const SessionRepository = {
  async findById(id: string): Promise<User | null> {
    return AppDataSource.getRepository(User).findOne({
      where: {
        id,
      },
    });
  },

  async createSession(data: {
    userId: string;
    title: string;
    startTime: Date;
    endTime: Date | null;
    durationMin: number | null;
    language: string;
    notes: string | null;
  }): Promise<Session> {
    const repo = AppDataSource.getRepository(Session);
    const session = repo.create(data);

    return repo.save(session);
  },
};
