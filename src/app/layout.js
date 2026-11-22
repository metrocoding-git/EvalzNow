import "./globals.css";
// Performance: the Geist Google fonts were downloaded on every page but their CSS
// variables were never applied to <body>, so they had no visual effect. Removed.
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'EvalzNow',
  icons: {
    icon: [
      { url: '/images/loading-icon.png' }
    ],
  },
};

// After a new deployment, a browser tab (or a cached page) of the previous build asks for JavaScript chunks
// that no longer exist on the server -> 404 -> "ChunkLoadError" -> "Application error: a client-side exception".
// This runs before any chunk loads and reloads the page once to get the current build (at most once per 30 s,
// so a real server problem cannot cause a reload loop).
const CHUNK_RELOAD_SCRIPT = `(function () {
  var KEY = "evz_chunk_reload_at";
  function isChunkError(text) { return /ChunkLoadError|Loading chunk [^ ]+ failed|Loading CSS chunk/i.test(text || ""); }
  function reloadOnce() {
    try {
      var last = Number(sessionStorage.getItem(KEY)) || 0;
      if (Date.now() - last < 30000) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch (e) { /* storage blocked: still reload */ }
    window.location.reload();
  }
  window.addEventListener("error", function (e) {
    var t = e && e.target;
    if (t && t.tagName === "SCRIPT" && t.src && t.src.indexOf("/_next/static/") !== -1) { reloadOnce(); return; }
    var err = e && e.error;
    if (isChunkError((e && e.message) || (err && (err.name + " " + err.message)))) reloadOnce();
  }, true);
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    if (r && isChunkError((r.name || "") + " " + (r.message || ""))) reloadOnce();
  });
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CHUNK_RELOAD_SCRIPT }} />
      </head>
      <body>
        {children}
        <Toaster  position="top-right" reverseOrder={false} /> 
      </body>
    </html>
  );
}
