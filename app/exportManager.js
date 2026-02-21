import { pool } from "./database.js";
import Cursor from "pg-cursor";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const EXPORTS = new Map();

export class ExportJob {
  constructor(filters, columns, delimiter = ",", quoteChar = '"') {
    this.id = uuidv4();
    this.status = "pending";
    this.filters = filters;
    this.columns = columns;
    this.delimiter = delimiter;
    this.quoteChar = quoteChar;
    this.totalRows = 0;
    this.processedRows = 0;
    this.error = null;
    this.createdAt = new Date();
    this.completedAt = null;
    this.cancelled = false;
    this.filePath = path.join("/app/exports", `export_${this.id}.csv`);
  }

  async run() {
    this.status = "processing";
    const client = await pool.connect();

    try {
      let whereClause = [];
      let values = [];

      if (this.filters.country_code) {
        values.push(this.filters.country_code);
        whereClause.push(`country_code = $${values.length}`);
      }

      let columns = this.columns?.length
        ? this.columns.join(",")
        : "*";

      let query = `SELECT ${columns} FROM users`;

      if (whereClause.length) {
        query += ` WHERE ${whereClause.join(" AND ")}`;
      }

      const countResult = await client.query(
        "SELECT COUNT(*) FROM users"
      );
      this.totalRows = parseInt(countResult.rows[0].count);

      const cursor = client.query(new Cursor(query, values));

      const writeStream = fs.createWriteStream(this.filePath);

      const readNext = () =>
        new Promise((resolve, reject) => {
          cursor.read(1000, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

      let isFirstChunk = true;

      while (true) {
        if (this.cancelled) break;

        const rows = await readNext();
        if (!rows.length) break;

        if (isFirstChunk) {
          writeStream.write(
            Object.keys(rows[0]).join(this.delimiter) + "\n"
          );
          isFirstChunk = false;
        }

        for (let row of rows) {
          if (this.cancelled) break;

          let line = Object.values(row)
            .map((val) =>
              `${this.quoteChar}${val}${this.quoteChar}`
            )
            .join(this.delimiter);

          writeStream.write(line + "\n");
          this.processedRows++;
        }
      }

      cursor.close(() => {});
      writeStream.end();

      if (this.cancelled) {
        this.status = "cancelled";
        fs.unlinkSync(this.filePath);
      } else {
        this.status = "completed";
        this.completedAt = new Date();
      }
    } catch (err) {
      this.status = "failed";
      this.error = err.message;
    } finally {
      client.release();
    }
  }
}