import { User } from "../../entities/User";
import { AppDataSource } from "../../config/database";

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return AppDataSource.getRepository(User).findOne({
      where: {
        email,
      },
    });
  },

  async createUser(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    const repo = AppDataSource.getRepository(User);
    const user = repo.create(data);

    return repo.save(user);
  },
};
