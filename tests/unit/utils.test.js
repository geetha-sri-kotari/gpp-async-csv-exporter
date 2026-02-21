import {
  buildWhereClause,
  validateColumns,
  formatCsvRow
} from "../../app/utils.js";

describe("Utils Unit Tests", () => {

  test("buildWhereClause builds correct SQL", () => {
    const { clause, values } = buildWhereClause({
      country_code: "US",
      min_ltv: 500
    });

    expect(clause).toContain("country_code = $1");
    expect(clause).toContain("lifetime_value >= $2");
    expect(values).toEqual(["US", 500]);
  });

  test("validateColumns filters invalid columns", () => {
    const result = validateColumns(["id", "email", "hack"]);
    expect(result).toEqual(["id", "email"]);
  });

  test("formatCsvRow formats correctly", () => {
    const row = { id: 1, name: "John" };
    const result = formatCsvRow(row, ",", '"');
    expect(result).toBe('"1","John"');
  });

});