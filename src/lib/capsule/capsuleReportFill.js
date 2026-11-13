/**
 * Fills one of Rick's .ez report templates (capsuleReportTemplates.js) line by line, so the generated
 * report keeps the template text and alignment exactly:
 *  - "Label     :     XXX / X.XXX / sample value"  → value from `values[label]` (labels compared with single spaces)
 *  - "||| A |||     ||| B |||" table headers         → rows from `tables[header]`, each value under its header text
 *  - "PASS → KEY ≥ 0.700" / "PASS → Parameter 01 ≤ X.XXX" → threshold from `thresholds[KEY]`
 *  - the generation date and the copyright year of the title box
 * Placeholders without a value become "-".
 */
import { finalize, reportDate } from "@/app/dashboard/analytics-view/data-reports/helper/reportFormat";

const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const keyOf = (s) => norm(s).replace(/∆/g, "Δ");
const PLACEHOLDER = /^(XXX|X\.XXX|Last Name, First Name)$/;
const show = (v) => (v === null || v === undefined || String(v).trim() === "" ? "-" : String(v));

/**
 * Table under a "||| A |||     ||| B |||" header. Each value starts under its header text; when the values of a
 * column are longer than the space before the next column, that next column (header and values) and all columns after it
 * move right, so columns never run into each other (Rick, Issue 03: Scan / Monitor / Therapy Type).
 * @returns { header, lines } – header: the header line with the final column positions
 */
export function layoutTable(headerLine, rows) {
  const cols = [];
  const re = /\|\|\| (.+?) \|\|\|/g;
  let m;
  while ((m = re.exec(headerLine))) cols.push({ at: m.index, token: m[0] });
  if (!cols.length) return { header: headerLine, lines: [] };
  const list = (rows || []).map((row) => cols.map((_, i) => show(row?.[i])));
  const GAP = 3; // at least 3 spaces after the longest value of a column
  const starts = [];
  let shift = 0;
  cols.forEach((c, i) => {
    let start = c.at + 4 + shift;
    if (i > 0) {
      const prevLongest = Math.max(0, ...list.map((r) => r[i - 1].length));
      const need = starts[i - 1] + prevLongest + GAP; // header spacing of the template is kept (columns only move by "shift")
      if (start < need) { shift += need - start; start = need; }
    }
    starts.push(start);
  });
  const header = shift === 0
    ? headerLine
    : cols.reduce((line, c, i) => line.padEnd(starts[i] - 4) + c.token, headerLine.slice(0, cols[0].at));
  const lines = list.length
    ? list.map((r) => r.reduce((line, v, i) => line.padEnd(i === 0 ? starts[0] : Math.max(starts[i], line.length + 2)) + v, ""))
    : [`${" ".repeat(starts[0])}-`];
  return { header, lines };
}

/** Rows only (header positions unchanged unless a column had to move). */
export function tableRows(headerLine, rows) {
  return layoutTable(headerLine, rows).lines;
}

/**
 * @param template  template text
 * @param values    { [label]: value }     (labels as in the template; spacing does not matter)
 * @param tables    { [header text]: rows } (header text = the table line with single spaces)
 * @param thresholds { [KEY]: value }       (Δ / ∆ are the same)
 * @returns { text, missing } – missing: labels with a placeholder that got no value (for checks)
 */
export function fillTemplate(template, { values = {}, tables = {}, thresholds = {} } = {}) {
  const V = Object.fromEntries(Object.entries(values).map(([k, v]) => [keyOf(k), v]));
  const T = Object.fromEntries(Object.entries(tables).map(([k, v]) => [keyOf(k), v]));
  const TH = Object.fromEntries(Object.entries(thresholds).map(([k, v]) => [keyOf(k), v]));
  const year = String(new Date().getFullYear());
  const missing = [];
  const out = [];

  template.split("\n").forEach((raw) => {
    let line = raw;
    if (line.includes("Report Generation Date: MMM DD, YYYY")) line = line.replace("MMM DD, YYYY", reportDate().padEnd(12).slice(0, 12));
    if (line.includes("COPYRIGHT (C) YYYY")) line = line.replace("YYYY", year);

    // table header → header + rows
    if (/^\s*\|\|\| /.test(line)) {
      const t = layoutTable(line, T[keyOf(line)]);
      out.push(t.header, "", ...t.lines);
      return;
    }

    // thresholds
    line = line.replace(/PASS → (.+?) (≥|≤) (X\.XXX|-?\d+(?:\.\d+)?)\s*$/, (all, key, op, sample) => {
      const t = TH[keyOf(key)];
      if (t === undefined) return all;
      return `PASS → ${key} ${op} ${show(t)}`;
    });

    // "Label   :     value"
    const kv = line.match(/^(\s*)(\S.*?\S)(\s+:\s+)(\S.*?)\s*$/);
    if (kv && !line.includes("PASS →")) {
      const [, indent, label, sep, sample] = kv;
      const k = keyOf(label);
      if (Object.prototype.hasOwnProperty.call(V, k)) {
        line = `${indent}${label}${sep}${show(V[k])}`;
      } else if (PLACEHOLDER.test(sample.trim()) || /^-?\d+(\.\d+)?$/.test(sample.trim())) {
        // template placeholder or template sample number without a value → "-"
        missing.push(label);
        line = `${indent}${label}${sep}-`;
      }
    }
    out.push(line);
  });
  return { text: finalize(out), missing };
}
