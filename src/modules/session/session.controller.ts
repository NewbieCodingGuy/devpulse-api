import { Request, Response, NextFunction } from "express";
import {
  createSession,
  deleteSession,
  getAllSession,
  getSessionByID,
  updateSession,
} from "./session.service";
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

export const getUserSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    );

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await getAllSession({ userId, page, limit });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserSessionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;

    if (!userId || !sessionId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await getSessionByID({ userId, sessionId });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserSession = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;

    const { title, language, notes, endTime } = req.body;

    if (!userId || !sessionId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await updateSession({
      userId,
      sessionId,
      title,
      language,
      notes,
      endTime: endTime ? new Date(endTime) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserSession = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;

    if (!userId || !sessionId) {
      throw new AppError("Unauthorized", 401);
    }

    await deleteSession({
      userId,
      sessionId,
    });

    res.status(200).json({
      success: true,
      message: "Session Deleted Successfully",
    });
  } catch (err) {
    next(err);
  }
};
