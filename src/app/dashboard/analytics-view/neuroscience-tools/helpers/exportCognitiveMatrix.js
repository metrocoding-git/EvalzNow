import { ensureExportLibs, ExcelJS } from "@/lib/exportLibs";
import { saveAs } from "file-saver";

const COL_LABEL = 2; // column B holds the labels, PP ID columns start at C

const fmtDate = (d = new Date()) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// yyyy-mm-dd in the user's own time zone (toISOString() would use UTC).
const localIsoDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const thin = { style: "thin", color: { argb: "FFBFBFBF" } };
const box = { top: thin, left: thin, bottom: thin, right: thin };

/**
 * Builds the Yes/No cognitive function matrix workbook for every candidate in a unit
 * (layout of the "Neuroscience" extraction template) and downloads it.
 *
 * @param {{ unit: object, candidates: Array }} matrix  response of GET /neuro-science/matrix/:unitId
 */
export async function exportCognitiveMatrix(matrix) {
  await ensureExportLibs();
  const { unit = {}, candidates = [] } = matrix || {};

  const wb = new ExcelJS.Workbook();
  wb.creator = "EvalzNow";
  const ws = wb.addWorksheet("Cognitive Matrix", {
    views: [{ state: "frozen", xSplit: COL_LABEL, ySplit: 0 }],
  });

  const maxPp = Math.max(1, ...candidates.map((c) => c.ppIds.length));
  ws.getColumn(1).width = 2;
  ws.getColumn(COL_LABEL).width = 62;
  for (let i = 0; i < maxPp; i++) ws.getColumn(COL_LABEL + 1 + i).width = 11;

  let r = 1;
  const put = (text, opts = {}) => {
    const cell = ws.getCell(r, COL_LABEL);
    cell.value = text;
    if (opts.bold) cell.font = { bold: true, size: opts.size || 11 };
    r++;
  };

  // Title block
  put("EvalzNow – A Novel Human Capital Assessment Method", { bold: true, size: 13 });
  put("Competency Accounting for Education and Industry");
  put("Hybrid Proficiency & Growth Monitoring");
  put(`Data Extraction Date: ${fmtDate()}`);
  r++;
  put(`Unit Name: ${unit.unitName ?? "-"}`);
  put(`Unit ID: ${unit.unitId ?? "-"}`);
  put(`Unit Type: ${unit.unitType ?? "-"}`);
  put(`Signature Profile: ${unit.signatureProfile ?? "-"}`);

  if (!candidates.length) {
    r++;
    put("No candidates in this unit.");
  }

  candidates.forEach((c) => {
    r++;
    put(`  Last Name: ${c.lastName ?? "-"}`, { bold: true });
    put(`  First Name: ${c.firstName ?? "-"}`, { bold: true });
    put(`  Candidate ID: ${c.candidateId ?? "-"}`, { bold: true });

    if (!c.ppIds.length) {
      r++;
      put("No cognitive function data recorded for this candidate.");
      return;
    }

    c.lobes.forEach(({ lobe, rows }) => {
      r++;
      // Header row: "<Lobe>: Cognitive Functions | PP ID 1 | PP ID 2 ..."
      const head = ws.getRow(r);
      head.getCell(COL_LABEL).value = `${lobe}: Cognitive Functions`;
      c.ppIds.forEach((pp, i) => { head.getCell(COL_LABEL + 1 + i).value = `PP ID ${pp}`; });
      for (let col = COL_LABEL; col <= COL_LABEL + c.ppIds.length; col++) {
        const cell = head.getCell(col);
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
        cell.alignment = { horizontal: col === COL_LABEL ? "left" : "center", vertical: "middle" };
        cell.border = box;
      }
      r++;

      rows.forEach(({ func, values }) => {
        const row = ws.getRow(r);
        const isCapacity = /^Functional Capacity/i.test(func);
        row.getCell(COL_LABEL).value = func;
        values.forEach((v, i) => {
          const cell = row.getCell(COL_LABEL + 1 + i);
          cell.value = v || "-";
          cell.alignment = { horizontal: "center" };
          if (v === "Yes") cell.font = { color: { argb: "FF1E7B34" } };
        });
        for (let col = COL_LABEL; col <= COL_LABEL + c.ppIds.length; col++) {
          const cell = row.getCell(col);
          cell.border = box;
          if (isCapacity) {
            cell.font = { ...(cell.font || {}), bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
          }
        }
        r++;
      });
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const safe = String(unit.unitId || unit.unitName || "unit").replace(/[^\w.-]+/g, "_");
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `Cognitive_Matrix_${safe}_${localIsoDate()}.xlsx`
  );
}
