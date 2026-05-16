import { Request, Response, NextFunction } from "express";
import { createSession } from "./session.service";
import { AppError } from "../../utils/AppError";

export const createUserSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { title, language, notes } = req.body;
    const result = await createSession({ userId, title, language, notes });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
