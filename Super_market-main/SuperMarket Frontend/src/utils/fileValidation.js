// validateCSVFile: reads first line of a CSV File and checks required headers
export async function validateCSVFile(
  file,
  requiredHeaders = [
    "name",
    "category",
    "quantity",
    "price",
    "minStock",
    "supplier",
    "expiryDate",
    "published",
  ],
) {
  if (!file || !file.name) return { valid: false, reason: "No file provided" };
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["csv", "xls", "xlsx", "pdf"].includes(ext))
    return {
      valid: false,
      reason: "Unsupported file type. Use .csv, .xlsx, .xls, or .pdf",
    };

  if (ext === "csv") {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result || "";
        const firstLine = text.split(/\r?\n/)[0] || "";
        const headers = firstLine
          .split(",")
          .map((h) => h.trim().replace(/^"|"$/g, ""));
        const missing = requiredHeaders.filter((h) => !headers.includes(h));
        if (missing.length)
          resolve({
            valid: false,
            reason: "Missing headers: " + missing.join(", "),
          });
        else resolve({ valid: true });
      };
      reader.onerror = () =>
        resolve({ valid: false, reason: "Unable to read file" });
      reader.readAsText(file);
    });
  }

  // For non-CSV types we assume server-side validation will handle structure
  return { valid: true };
}
