import request from "supertest";
import app from "../app";
import { cleanDatabase } from "./cleanup";

const getToken = async () => {
  const _email = `sessions${Date.now()}@test.com`;
  await request(app).post("/api/auth/register").send({
    name: "John",
    email: _email,
    password: "password123",
  });

  const response = await request(app).post("/api/auth/login").send({
    email: _email,
    password: "password123",
  });

  return response.body.data.token;
};

//helper
const createSession = async (token: string) => {
  const response = await request(app)
    .post("/api/sessions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Learning Load Testing with k6",
      language: "Typescript",
      notes: "Api Load Testing",
    });

  return response.body.data.userSession;
};

describe("Session", () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();
    token = await getToken();
  });

  it("should create a session", async () => {
    const response = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Learning Load Testing with k6",
        language: "Javascript, Typescript",
        notes: "Api Load Testing",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userSession).toHaveProperty("id");
    expect(response.body.data.userSession.title).toBe(
      "Learning Load Testing with k6",
    );
  });

  it("should get all sessions", async () => {
    await createSession(token);

    const response = await request(app)
      .get("/api/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.allSessions.length).toBe(1);
  });

  it("should get session by id", async () => {
    const session = await createSession(token);

    const response = await request(app)
      .get(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.sessionData.id).toBe(session.id);
  });

  it("should return 404 for unknown session", async () => {
    const response = await request(app)
      .get("/api/sessions/non-existent-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should update session title", async () => {
    const session = await createSession(token);

    const response = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Session Title",
      });

    expect(response.status).toBe(200);

    expect(response.body.data.sessionData.title).toBe("Updated Session Title");
  });

  it("should complete a session and calculate duration", async () => {
    const session = await createSession(token);

    const endTime = new Date(Date.now() + 60 * 60 * 1000);

    const response = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        endTime,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.sessionData.durationMin).toBeGreaterThan(0);
  });

  it("should reject endTime before startTime", async () => {
    const session = await createSession(token);

    const invalidTime = new Date(Date.now() - 60 * 60 * 1000);

    const response = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        endTime: invalidTime,
      });

    expect(response.status).toBe(400);
  });

  it("should delete a session", async () => {
    const session = await createSession(token);

    const response = await request(app)
      .delete(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it("should not find deleted session", async () => {
    const session = await createSession(token);

    await request(app)
      .delete(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .get(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).get("/api/sessions");

    expect(response.status).toBe(401);
  });

  it("should paginate sessions", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: `Session ${i}`,
          language: "Typescript",
        });
    }

    const response = await request(app)
      .get("/api/sessions?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.allSessions.length).toBe(2);

    expect(response.body.data.pagination.total).toBe(5);
  });
});
