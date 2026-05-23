import express from "express";
import {
  createUserSession,
  getUserSessions,
  getUserSessionById,
  updateUserSession,
  deleteUserSession,
} from "./session.controller";
import { authenticateToken } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createSessionSchema, updateSessionSchema } from "./session.schema";

const sessionRoutes = express.Router();

sessionRoutes.post(
  "/sessions",
  authenticateToken,
  validate(createSessionSchema),
  createUserSession,
);

sessionRoutes.get("/sessions", authenticateToken, getUserSessions);

sessionRoutes.get("/sessions/:id", authenticateToken, getUserSessionById);

sessionRoutes.patch(
  "/sessions/:id",
  authenticateToken,
  validate(updateSessionSchema),
  updateUserSession,
);

sessionRoutes.delete("/sessions/:id", authenticateToken, deleteUserSession);

export { sessionRoutes };
