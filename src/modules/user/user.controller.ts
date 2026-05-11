import { Request, Response, NextFunction } from "express";
import { register } from "./user.service";

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
