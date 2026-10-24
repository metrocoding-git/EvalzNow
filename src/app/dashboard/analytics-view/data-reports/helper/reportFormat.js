// Layout helpers for the .ez text reports. Every report is built as a list of lines with
// these helpers, so labels, colons and table columns line up the same way in all reports and
// there is never more than one blank line between blocks.
import { HEADER_LINES, INTRO_LINES, NOMENCLATURE_LINES, LEGAL_LINES, END_LINES } from "./reportText";

const BOX_INNER = 75; // characters between the "**" borders of the title box

/** "1.234" or "-" */
export const n3 = (v) => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n.toFixed(3) : "-";
};

/** "12.50" or "-" */
export const n2 = (v) => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n.toFixed(2) : "-";
};

export const text = (v) => (v === null || v === undefined || String(v).trim() === "" ? "-" : String(v));

export const isoDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? text(v) : d.toISOString().split("T")[0];
};

export const reportDate = (d = new Date()) =>
  d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

/** Title box with the report level, generation date and copyright year filled in. */
export function headerLines(level) {
  const year = String(new Date().getFullYear());
  const date = reportDate();
  const boxLine = (prefixInsideBox, value) => {
    const inner = (prefixInsideBox + value).padEnd(BOX_INNER).slice(0, BOX_INNER);
    return `${" ".repeat(53)}**${inner}**`;
  };
  return HEADER_LINES.map((l) => {
    if (l.includes("Analysis Report Level:")) return boxLine("                      Analysis Report Level: ", level);
    if (l.includes("Report Generation Date:")) return boxLine("                    Report Generation Date: ", date);
    if (l.includes("COPYRIGHT (C) YYYY")) return l.replace("YYYY", year);
    return l;
  });
}

export const introLines = () => [...INTRO_LINES];

export function sectionBanner(n) {
  const label = `SECTION ${String(n).padStart(2, "0")}`;
  return `${"*".repeat(55)}${" ".repeat(34)}${label}${" ".repeat(31)}${"*".repeat(55)}`;
}

export function subHeader(title, indent = "") {
  const rule = `${indent}---------------------------------------`;
  // Title one space in from the rule (Candidate / Unit templates) or aligned with it (Global).
  return [rule, indent ? `${indent}${title}` : ` ${title}`, rule, ""];
}

/** "     Label ......  :     value" with the colon in a fixed column. */
export function kv(label, value, { indent = 5, width = 42 } = {}) {
  return `${" ".repeat(indent)}${String(label).padEnd(width)}:     ${value}`;
}

/**
 * Table with "||| HEADER |||" titles. Each value starts under its header text, and a column
 * widens when a value is longer than its header, so columns always line up.
 * rows: array of arrays (one value per header). Empty -> a single "-" row.
 */
export function table(headers, rows, { indent = 5, gap = 5, empty = "-" } = {}) {
  const cells = headers.map((h) => `||| ${h} |||`);
  const data = (rows || []).map((row) => headers.map((_, i) => text(row[i])));
  const widths = cells.map((c, i) => Math.max(c.length, ...data.map((r) => r[i].length + 4 + 2)));

  const starts = [];
  let pos = indent;
  widths.forEach((w, i) => {
    starts.push(pos + 4); // value starts where the header text starts
    pos += w + gap;
  });

  const head = " ".repeat(indent) + cells.map((c, i) => (i === cells.length - 1 ? c : c.padEnd(widths[i] + gap))).join("");
  const body = data.length
    ? data.map((r) => r.reduce((line, v, i) => line.padEnd(starts[i]) + v, ""))
    : [`${" ".repeat(indent + 4)}${empty}`];

  return [head, "", ...body, ""];
}

export const nomenclatureBlock = () => [...subHeader("NOMENCLATURE:"), ...NOMENCLATURE_LINES, ""];
export const legalBlock = () => [...subHeader("LEGAL NOTICE:"), ...LEGAL_LINES, "", ...END_LINES];

/**
 * Joins the lines, removes trailing spaces and keeps at most one blank line between
 * blocks (SPACING requirement: 1 line max in-between sections).
 */
export function finalize(lines) {
  const flat = lines.flat(Infinity).map((l) => String(l ?? "").replace(/\s+$/g, ""));
  const out = [];
  flat.forEach((l) => {
    if (l === "" && (out.length === 0 || out[out.length - 1] === "")) return;
    out.push(l);
  });
  while (out.length && out[out.length - 1] === "") out.pop();
  return out.join("\n") + "\n";
}
