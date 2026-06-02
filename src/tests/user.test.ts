import request from "supertest";
import app from "../app";

import { cleanDatabase } from "./cleanup";

describe("Auth", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /register", () => {
    it("should register a user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John",
          email: `test${Date.now()}@test.com`,
          password: "password123",
        });

      expect(response.status).toBe(201);

      expect(response.body.success).toBe(true);

      expect(response.body.data.token).toBeDefined();

      expect(response.body.data.user.email).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      const _email = `test${Date.now()}@test.com`;
      await request(app).post("/api/auth/register").send({
        name: "John",
        email: _email,
        password: "password123",
      });

      const response = await request(app).post("/api/auth/register").send({
        name: "John",
        email: _email,
        password: "password123",
      });

      expect(response.status).toBe(409);
    });
  });

  describe("POST /login", () => {
    it("should login successfully", async () => {
      const _email = `login${Date.now()}@test.com`;
      await request(app).post("/api/auth/register").send({
        name: "John",
        email: _email,
        password: "password123",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: _email,
        password: "password123",
      });

      expect(response.status).toBe(200);

      expect(response.body.data.token).toBeDefined();
    });
  });

  describe("GET /me", () => {
    it("should return current user", async () => {
      const _email = `me${Date.now()}@test.com`;
      await request(app).post("/api/auth/register").send({
        name: "John",
        email: _email,
        password: "password123",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: _email,
        password: "password123",
      });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data.user.email).toBe(_email);
    });
  });
});
