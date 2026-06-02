import { AppDataSource } from "../config/database";

export const cleanDatabase = async () => {
  const entities = AppDataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);

    await repository.query(`SET FOREIGN_KEY_CHECKS = 0;`);

    await repository.clear();

    await repository.query(`SET FOREIGN_KEY_CHECKS = 1;`);
  }
};
