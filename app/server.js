import express from "express";
import fs from "fs";
import zlib from "zlib";
import { ExportJob, EXPORTS } from "./exportManager.js";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/exports/csv", async (req, res) => {
  const { country_code, columns, delimiter, quoteChar } = req.query;

  const job = new ExportJob(
    { country_code },
    columns ? columns.split(",") : null,
    delimiter || ",",
    quoteChar || '"'
  );

  EXPORTS.set(job.id, job);

  job.run(); // async background

  res.status(202).json({
    exportId: job.id,
    status: job.status,
  });
});

app.get("/exports/:id/status", (req, res) => {
  const job = EXPORTS.get(req.params.id);
  if (!job) return res.sendStatus(404);

  res.json({
    exportId: job.id,
    status: job.status,
    progress: {
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      percentage:
        job.totalRows > 0
          ? (job.processedRows / job.totalRows) * 100
          : 0,
    },
    error: job.error,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
});

app.get("/exports/:id/download", (req, res) => {
  const job = EXPORTS.get(req.params.id);
  if (!job || job.status !== "completed")
    return res.sendStatus(404);

  const stat = fs.statSync(job.filePath);
  const range = req.headers.range;

  if (req.headers["accept-encoding"]?.includes("gzip")) {
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Type", "text/csv");
    fs.createReadStream(job.filePath)
      .pipe(zlib.createGzip())
      .pipe(res);
    return;
  }

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0]);
    const end = parts[1]
      ? parseInt(parts[1])
      : stat.size - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "text/csv",
    });

    fs.createReadStream(job.filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "text/csv",
      "Accept-Ranges": "bytes",
      "Content-Disposition": `attachment; filename="export_${job.id}.csv"`,
    });

    fs.createReadStream(job.filePath).pipe(res);
  }
});

app.delete("/exports/:id", (req, res) => {
  const job = EXPORTS.get(req.params.id);
  if (!job) return res.sendStatus(404);

  job.cancelled = true;
  res.sendStatus(204);
});

// app.listen(process.env.API_PORT || 8080, () => {
//   console.log("Server running...");
// });

export default app;

// Only start server if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.API_PORT || 8080, () => {
    console.log("Server running...");
  });
}