import express from "express";
import { authUser, loginUser, registerUser } from "./user.controller";
import { loginSchema, registerSchema } from "./user.schema";
import { validate } from "../../middlewares/validate";
import { authenticateToken } from "../../middlewares/authenticate";
import { authLimiter } from "../../middlewares/rateLimiter";

const userRoutes = express.Router();

userRoutes.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  registerUser,
);
userRoutes.post("/login", authLimiter, validate(loginSchema), loginUser);
userRoutes.get("/me", authenticateToken, authUser);

export { userRoutes };
