import request from "supertest";
import app from "../../app/server.js";

describe("Export Routes Integration Test", () => {

  let exportId;

  test("Health endpoint works", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("Initiate export returns 202", async () => {
    const res = await request(app)
      .post("/exports/csv")
      .query({ country_code: "US" });

    expect(res.statusCode).toBe(202);
    expect(res.body.exportId).toBeDefined();

    exportId = res.body.exportId;
  });

  test("Status endpoint returns progress structure", async () => {
    const res = await request(app)
      .get(`/exports/${exportId}/status`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("progress");
  });

  test("Cancel endpoint returns 204", async () => {
    const res = await request(app)
      .delete(`/exports/${exportId}`);

    expect(res.statusCode).toBe(204);
  });

});