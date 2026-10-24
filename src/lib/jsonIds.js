// Benchmark ID lists come back as an array (MySQL JSON), as JSON text (MariaDB) or as
// double-encoded text. JSON.parse(array) throws, so always go through this helper.
export function toIdArray(value) {
  let v = value;
  for (let i = 0; i < 2 && typeof v === "string"; i++) {
    try { v = JSON.parse(v || "[]"); } catch { return []; }
  }
  return Array.isArray(v) ? v : [];
}
