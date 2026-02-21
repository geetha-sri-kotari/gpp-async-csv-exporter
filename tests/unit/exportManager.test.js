import { ExportJob } from "../../app/exportManager.js";

describe("ExportJob Unit Test", () => {

  test("New job starts in pending state", () => {
    const job = new ExportJob({}, null);
    expect(job.status).toBe("pending");
    expect(job.processedRows).toBe(0);
  });

  test("Job generates UUID", () => {
    const job = new ExportJob({}, null);
    expect(job.id).toBeDefined();
    expect(typeof job.id).toBe("string");
  });

});