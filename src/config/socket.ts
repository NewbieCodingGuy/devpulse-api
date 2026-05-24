import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { User } from "../entities/User";
import config from "./env";
import jwt from "jsonwebtoken";
import { AppDataSource } from "./database";

interface JwtPayload {
  userId: string;
  email: string;
}

declare module "socket.io" {
  interface Socket {
    user?: User;
  }
}

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const cleanToken = token.replace("Bearer ", "");
      const decoded = jwt.verify(cleanToken, config.jwtSecret) as JwtPayload;

      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      socket.join(user.id);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}, user: ${socket.user?.id}`);

    socket.on("disconnect", () => {
      console.log("Client disconnected: ", socket.id);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
