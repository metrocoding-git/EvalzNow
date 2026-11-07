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

function tableRows(headerLine, rows) {
  const starts = [];
  const re = /\|\|\| (.+?) \|\|\|/g;
  let m;
  while ((m = re.exec(headerLine))) starts.push(m.index + 4);
  if (!rows || !rows.length) return [`${" ".repeat(starts[0] ?? 9)}-`];
  return rows.map((row) => starts.reduce((line, start, i) => {
    const v = show(row[i]);
    const at = line.length + 2 > start ? line.length + 2 : start; // keep two spaces when a value is long
    return line.padEnd(at) + v;
  }, ""));
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
      out.push(line, "", ...tableRows(line, T[keyOf(line)]));
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
