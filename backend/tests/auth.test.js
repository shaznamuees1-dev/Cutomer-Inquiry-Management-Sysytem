
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const inquiryRoutes = require("../src/routes/inquiryRoutes");

test("GET /api/inquiries rejects requests without a JWT", async () => {
  const app = express();

  app.use(express.json());
  app.use("/api/inquiries", inquiryRoutes);

  const response = await request(app)
    .get("/api/inquiries");

  // Protected resources must not be accessible anonymously.
  assert.equal(response.status, 401);
});

test("POST /api/inquiries rejects requests without a JWT", async () => {
  const app = express();

  app.use(express.json());
  app.use("/api/inquiries", inquiryRoutes);

  const response = await request(app)
    .post("/api/inquiries")
    .send({
      customer_name: "Test Customer",
      contact: "test@example.com",
      subject: "Test inquiry",
      description: "This request has no authentication token.",
    });

  assert.equal(response.status, 401);
});
