/**
 * Fills one of Rick's Audit Status templates (auditTemplates.js) line by line, so the generated file keeps the
 * template text and alignment exactly.
 *
 *  - "Label      :     XXX" / "Last Name, First Name"  → values[label]                    (else "-")
 *  - a list title ("Candidates with … < 0.XXX", "Capsules with … ≤ 10", "List of Failed Candidates", …)
 *    → resolve(section) gives { threshold, rows }; "0.XXX" in the title becomes the threshold
 *  - the "||| A |||     ||| B |||" header after a title → the rows of that title ("-" when none)
 *  - "# of … : XX" after a table → threshold (if "0.XXX") and the number of rows of that table
 *  - "Total Capsule Count / Total Unit Count : XX" → values[label]
 *  - generation date and copyright year of the title box
 */
import { finalize, reportDate } from "@/app/dashboard/analytics-view/data-reports/helper/reportFormat";
import { tableRows } from "@/lib/capsule/capsuleReportFill";

const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const show = (v) => (v === null || v === undefined || String(v).trim() === "" ? "-" : String(v));
const TITLE = /^(Candidates|Capsules|Units|Leaders) with |^List of Failed Candidates/;

/**
 * Section of a list title.
 *  key: CTL10 | BC10 | AB8 | ATTENDANCE | OPEN_NEEDS | NEG_CANDIDATE_MARKS | NEG_LEADER_MARKS | FAILED | MISSING
 *       | PARAM_<n> | PROD_<CSD|NSD|USD> | <metric> | CUM_<metric>   (metric e.g. PC1, XCFL, RRN, XEP, MSIP, IC, ΔPC1, ΔGEQ)
 *  op: "<" | ">" | "≤" | null;  fixed: the number written in the title (null for "0.XXX" / none)
 */
export function sectionOf(title) {
  const t = norm(title).replace(/∆/g, "Δ");
  const opm = t.match(/(<|>|≤)\s*(-?\d+(?:\.\d+)?|0\.XXX)\s*$/);
  const op = opm ? opm[1] : null;
  const fixed = opm && opm[2] !== "0.XXX" ? Number(opm[2]) : null;
  let key = null;
  if (/Candidate-to-Leader Ratio ≤ 10$/.test(t)) key = "CTL10";
  else if (/Benchmarks Count ≤ 10$/.test(t)) key = "BC10";
  // template: "… with Candidate-to-Leader Ratio ≤ 8" followed by "# of … with Assessment Blocks ≤ 8"
  else if (/Candidate-to-Leader Ratio ≤ 8$/.test(t) || /Assessment Blocks ≤ 8$/.test(t)) key = "AB8";
  else if (/Attendance - Present/.test(t)) key = "ATTENDANCE";
  else if (/Open Items in Needs Assessment/.test(t)) key = "OPEN_NEEDS";
  else if (/Negative Candidate Marks/.test(t)) key = "NEG_CANDIDATE_MARKS";
  else if (/Negative Leader Marks/.test(t)) key = "NEG_LEADER_MARKS";
  else if (/^List of Failed Candidates/.test(t)) key = "FAILED";
  else if (/Missing Data/.test(t)) key = "MISSING";
  else if (/Parameter (\d+)/.test(t)) key = `PARAM_${t.match(/Parameter (\d+)/)[1]}`;
  else if (/Productivity \((\w+)\)/.test(t)) key = `PROD_${t.match(/Productivity \((\w+)\)/)[1]}`;
  else {
    const m = t.match(/\(([^()]+)\)\s*[<>]/) || t.match(/[-,]\s*([A-Z0-9Δ]+)\s*[<>]/);
    if (m) key = `${/^Candidates with Cumulative /.test(t) ? "CUM_" : ""}${m[1]}`;
  }
  return { key, op, fixed };
}

/**
 * @param template  template text
 * @param values    { [label]: value } for "Label : XXX" lines (spacing does not matter)
 * @param resolve   (section) => ({ threshold: string|null, rows: any[][] })
 * @returns { text, unknown } – unknown: list titles that could not be mapped (for checks)
 */
export function fillAudit(template, { values = {}, resolve }) {
  const V = Object.fromEntries(Object.entries(values).map(([k, v]) => [norm(k), v]));
  const year = String(new Date().getFullYear());
  const out = [];
  const unknown = [];
  let current = null;

  template.split("\n").forEach((raw) => {
    let line = raw;
    if (line.includes("Generation Date: MMM DD, YYYY")) line = line.replace("MMM DD, YYYY", reportDate().padEnd(12).slice(0, 12));
    if (line.includes("COPYRIGHT (C) YYYY")) line = line.replace("YYYY", year);
    const t = line.trim();

    // table header → header + rows of the current list
    if (/^\|\|\| /.test(t)) {
      out.push(line, "", ...tableRows(line, current?.rows || []));
      return;
    }

    // list title
    if (TITLE.test(t)) {
      const section = sectionOf(t);
      const got = section.key ? resolve(section) : null;
      if (!got) unknown.push(t);
      current = { threshold: got?.threshold ?? null, rows: got?.rows || [] };
      if (current.threshold !== null) line = line.replace("0.XXX", current.threshold);
      out.push(line);
      return;
    }

    // "# of … : XX" → count of the list above
    if (t.startsWith("#")) {
      if (current?.threshold !== null && current?.threshold !== undefined) line = line.replace("0.XXX", current.threshold);
      line = line.replace(/(:\s*)(XXX|XX)\s*$/, (all, sep) => `${sep}${current ? current.rows.length : "-"}`);
      out.push(line);
      return;
    }

    // "Label : value"
    const kv = line.match(/^(\s*)(\S.*?\S)(\s+:\s+)(\S.*?)\s*$/);
    if (kv) {
      const [, indent, label, sep, sample] = kv;
      const k = norm(label);
      if (Object.prototype.hasOwnProperty.call(V, k)) {
        line = `${indent}${label}${sep}${show(V[k])}`;
      } else if (/^(XXX|XX|Last Name, First Name)$/.test(sample.trim())) {
        line = `${indent}${label}${sep}-`;
      }
    }
    out.push(line);
  });
  return { text: finalize(out), unknown };
}
