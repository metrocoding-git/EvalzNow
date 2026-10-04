/**
 * Export libraries loaded on demand (performance).
 *
 * ExcelJS, SheetJS (xlsx), jsPDF and html2canvas together are ~1.4 MB of JavaScript.
 * They were bundled into every analytics page, so each page downloaded/parsed them
 * before it could display anything - even though they are only used when the user
 * clicks an Export / Download button.
 *
 * Now they are fetched in the background after the page is idle, and every export
 * handler awaits `ensureExportLibs()` first, so exports work exactly as before.
 */

// Live ES-module bindings: importers see the real library once it is loaded.
export let ExcelJS;
export let XLSX;
export let jsPDF;

let html2canvasImpl;
let loading = null;

export function ensureExportLibs() {
  if (!loading) {
    loading = Promise.all([
      import("exceljs"),
      import("xlsx"),
      import("jspdf"),
      import("html2canvas-pro"),
    ])
      .then(([excel, xlsx, pdf, h2c]) => {
        ExcelJS = excel.default || excel;
        XLSX = xlsx;
        jsPDF = pdf.default || pdf.jsPDF;
        html2canvasImpl = h2c.default || h2c;
      })
      .catch((err) => {
        loading = null; // allow retry (e.g. network hiccup)
        throw err;
      });
  }
  return loading;
}

/** Drop-in replacement for `html2canvas(...)` (it is always awaited by callers). */
export async function html2canvas(...args) {
  await ensureExportLibs();
  return html2canvasImpl(...args);
}

// Warm the cache quietly a few seconds after the page has fully loaded, so the
// download never competes with the page's own images and data. Skipped on slow /
// data-saver connections (the libraries then load on the first export click).
if (typeof window !== "undefined") {
  const conn = navigator.connection || {};
  const slow = conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || "");
  if (!slow) {
    const warm = () => {
      const run = () => ensureExportLibs().catch(() => {});
      if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 10000 });
      else run();
    };
    const schedule = () => setTimeout(warm, 6000);
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
  }
}
