import { DataSource } from "typeorm";
import config from "./env"; // adjust import as needed

// const isCompiled = __filename.endsWith(".js");
const isCompiled = process.env.NODE_ENV === "production";
// const isCompiled = __filename.endsWith(".js");
const entityPath = isCompiled
  ? "dist/entities/**/*.js"
  : "src/entities/**/*.ts";
const migrationPath = isCompiled
  ? "dist/migrations/**/*.js"
  : "src/migrations/**/*.ts";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: false, // never true in production — you now know why
  logging: process.env.NODE_ENV === "development", // think about when you want query logging on
  entities: [entityPath], // where your entity files will live
  migrations: [migrationPath], // where your migration files will live
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    acquireTimeout: 30000,
    idleTimeout: 60000,
  },
});
