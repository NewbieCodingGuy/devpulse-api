import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository";
import config from "../../config/env";
import { AppError } from "../../utils/AppError";
import { SafeUser } from "../../types/user.types";

export const register = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: SafeUser }> => {
  const exists = await UserRepository.findByEmail(email);

  if (exists !== null) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword: string = await bcrypt.hash(password, 10);

  const user = await UserRepository.createUser({
    email,
    password: hashedPassword,
    name,
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: 60 * 60 * 24 * 7 },
  );

  const safeUser: SafeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
  };

  return {
    token,
    user: safeUser,
  };
};
