const { io } = require("socket.io-client");

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzQ5ZjU5YS00ZDFiLTQxZTEtYjFhYy04OGY5Y2QyNDkzNDIiLCJlbWFpbCI6InNoZWtoYXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3Nzk2MTc1MTAsImV4cCI6MTc4MDIyMjMxMH0.c6MtBv877SfQSmo5UqQm8ygOzx5_PvY0kQJSEyWuxBs"; // paste your login token

const socket = io("http://localhost:3000", {
  auth: {
    token: `Bearer ${TOKEN}`,
  },
});

socket.on("connect", () => {
  console.log("Connected to server, socket id:", socket.id);
});

socket.on("session:summary-ready", (data) => {
  console.log("AI Summary received!");
  console.log("Session ID:", data.sessionId);
  console.log("Summary:", data.aiSummary);
});

socket.on("connect_error", (err) => {
  console.error("Connection failed:", err.message);
});
