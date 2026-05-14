import { Request, Response, NextFunction } from "express";
import { SafeUser } from "../../types/user.types";
import { login, register } from "./user.service";
import { AppError } from "../../utils/AppError";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const result = await register({ name, email, password });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    };

    res.status(200).json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
};
