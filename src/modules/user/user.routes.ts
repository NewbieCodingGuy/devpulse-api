import express from "express";
import { registerUser } from "./user.controller";
import { registerSchema } from "./user.schema";
import { validate } from "../../middlewares/validate";

const userRoutes = express.Router();

userRoutes.post("/register", validate(registerSchema), registerUser);

export { userRoutes };
