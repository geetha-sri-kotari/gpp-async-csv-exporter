import fs from "fs";

/**
 * Build dynamic WHERE clause with parameter binding
 */
export function buildWhereClause(filters) {
  const conditions = [];
  const values = [];

  if (filters.country_code) {
    values.push(filters.country_code);
    conditions.push(`country_code = $${values.length}`);
  }

  if (filters.subscription_tier) {
    values.push(filters.subscription_tier);
    conditions.push(`subscription_tier = $${values.length}`);
  }

  if (filters.min_ltv) {
    values.push(filters.min_ltv);
    conditions.push(`lifetime_value >= $${values.length}`);
  }

  const clause =
    conditions.length > 0
      ? "WHERE " + conditions.join(" AND ")
      : "";

  return { clause, values };
}

/**
 * Validate requested columns against allowed columns
 */
export function validateColumns(requestedColumns) {
  const allowed = [
    "id",
    "name",
    "email",
    "signup_date",
    "country_code",
    "subscription_tier",
    "lifetime_value",
  ];

  if (!requestedColumns) return null;

  const filtered = requestedColumns.filter((col) =>
    allowed.includes(col)
  );

  return filtered.length ? filtered : null;
}

/**
 * Format a single row into CSV line
 */
export function formatCsvRow(row, delimiter, quoteChar) {
  return Object.values(row)
    .map((val) =>
      `${quoteChar}${String(val).replace(
        new RegExp(quoteChar, "g"),
        quoteChar + quoteChar
      )}${quoteChar}`
    )
    .join(delimiter);
}

/**
 * Delete file safely
 */
export function deleteFileIfExists(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}