import express from "express";
import { authUser, loginUser, registerUser } from "./user.controller";
import { loginSchema, registerSchema } from "./user.schema";
import { validate } from "../../middlewares/validate";
import { authenticateToken } from "../../middlewares/authenticate";

const userRoutes = express.Router();

userRoutes.post("/register", validate(registerSchema), registerUser);
userRoutes.post("/login", validate(loginSchema), loginUser);
userRoutes.get("/me", authenticateToken, authUser);

export { userRoutes };
