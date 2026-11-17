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

/**
 * Drop-in replacement for `html2canvas(...)` (it is always awaited by callers).
 *
 * html2canvas draws a copy of the page laid out in a "window" of windowWidth x windowHeight. Several
 * exports passed the chart's own width there, so the copy of the page was laid out narrower than the
 * screen: the chart got less room than its drawing needs and the right side, the x-axis labels and the
 * legend were cut off in the JPG / PDF (Rick, Issue 09). The window is now never smaller than the real
 * one, and the capture always covers the whole element.
 */
export async function html2canvas(element, options = {}, ...rest) {
  await ensureExportLibs();
  const o = { ...(options || {}) };
  if (element && element.isConnected && typeof window !== "undefined") {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    if (o.windowWidth !== undefined && o.windowWidth < vw) o.windowWidth = vw;
    if (o.windowHeight !== undefined && o.windowHeight < vh) o.windowHeight = vh;
    if (o.width !== undefined) o.width = Math.max(o.width, element.scrollWidth);
    if (o.height !== undefined) o.height = Math.max(o.height, element.scrollHeight);
  }
  return html2canvasImpl(element, o, ...rest);
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
