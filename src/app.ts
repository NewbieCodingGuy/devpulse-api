import express from "express";
import { userRoutes } from "./modules/user/user.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { sessionRoutes } from "./modules/session/session.routes";
import { globalLimiter } from "./middlewares/rateLimiter";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
app.use(helmet());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json());
app.use(globalLimiter);

// routes
app.use("/api/auth", userRoutes);

app.use("/api", sessionRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// errorHandler
app.use(errorHandler);

export default app;
