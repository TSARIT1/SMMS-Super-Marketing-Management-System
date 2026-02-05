import { describe, it, expect } from "vitest";
import { validateCSVFile } from "../fileValidation";

function makeFile(contents, name = "test.csv") {
  return new File([contents], name, { type: "text/csv" });
}

describe("validateCSVFile", () => {
  it("valid CSV with headers passes", async () => {
    const csv =
      "name,category,quantity,price,minStock,supplier,expiryDate,published\nSample,Test,10,9.99,2,Co,2026-01-01,true";
    const file = makeFile(csv, "ok.csv");
    const res = await validateCSVFile(file);
    expect(res.valid).toBe(true);
  });

  it("missing headers fails", async () => {
    const csv = "name,category,quantity,price\nSample,Test,10,9.99";
    const file = makeFile(csv, "bad.csv");
    const res = await validateCSVFile(file);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Missing headers");
  });

  it("unsupported file type fails", async () => {
    const file = new File(["dummy"], "file.exe", {
      type: "application/octet-stream",
    });
    const res = await validateCSVFile(file);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Unsupported file type");
  });
});
