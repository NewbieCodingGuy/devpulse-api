import express from "express";
import { createUserSession } from "./session.controller";
import { authenticateToken } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createSessionSchema } from "./session.schema";

const sessionRoutes = express.Router();

sessionRoutes.post(
  "/sessions",
  authenticateToken,
  validate(createSessionSchema),
  createUserSession,
);

export { sessionRoutes };
