import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  redisUrl: string;
  openaiKey: string;
}

const config: Config = {
  port: parsePort(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: requireEnv("JWT_SECRET"),
  dbHost: requireEnv("DB_HOST"),
  dbPort: parsePort(process.env.DB_PORT, 3306),
  dbUser: requireEnv("DB_USER"),
  dbPassword: requireEnv("DB_PASSWORD"),
  dbName: requireEnv("DB_NAME"),
  redisUrl: requireEnv("REDIS_URL"),
  openaiKey: requireEnv("OPENAI_API_KEY"),
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parsePort(raw: string | undefined, defaultPort: number): number {
  const port = parseInt(raw || String(defaultPort), 10);
  if (isNaN(port)) {
    throw new Error(`Expected a valid port number, got: "${raw}"`);
  }
  return port;
}

export default config;
