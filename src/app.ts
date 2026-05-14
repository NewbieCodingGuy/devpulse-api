import express from "express";
import { userRoutes } from "./modules/user/user.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(express.json());

// routes
app.use("/api/auth", userRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// errorHandler
app.use(errorHandler);

export default app;
