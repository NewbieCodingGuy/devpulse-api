import "reflect-metadata";
import app from "./app";
import config from "./config/env";
import { AppDataSource } from "./config/database";
import "./workers/session.worker";

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    app
      .listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
      })
      .on("error", (err) => {
        console.error("Server failed to start:", err);
        process.exit(1);
      });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
