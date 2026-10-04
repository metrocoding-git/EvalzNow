/**
 * Central session helpers (security).
 *
 * Logout policy:
 *  - "Log Out" button, 30-min idle timeout, an expired/revoked token, opening the
 *    public home page (/) or the login page while signed in  ->  session ends.
 *  - Ending a session: the token is revoked on the server (it cannot be reused even
 *    if copied), all local session data is wiped, every open tab is signed out, and
 *    the browser history entry is replaced so the Back button cannot show dashboard pages.
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";
const LOGOUT_SIGNAL_KEY = "evz-logout"; // cross-tab broadcast

const isBrowser = () => typeof window !== "undefined";

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/+$/, "");

export function getToken() {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Decode the JWT payload (no verification - the server does that). */
function decodePayload(token) {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** True when a token exists and has not passed its expiry time. */
export function hasValidSession() {
  const token = getToken();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

/** Remove every trace of the session from this browser tab. */
export function clearSession() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch { /* storage blocked */ }
  try {
    sessionStorage.clear();
  } catch { /* storage blocked */ }
}

/** Tell the server to revoke this token. Best-effort, never blocks logout. */
function revokeOnServer(token) {
  if (!token) return;
  try {
    fetch(`${apiBase()}/account/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
      keepalive: true, // still delivered while the page is navigating away
      credentials: "omit",
    }).catch(() => {});
  } catch { /* ignore */ }
}

let loggingOut = false;

/**
 * End the session.
 * @param {object} opts
 * @param {boolean} [opts.redirect=true]  go to /login (history entry is replaced)
 * @param {boolean} [opts.broadcast=true] sign out other open tabs too
 */
export function logout({ redirect = true, broadcast = true } = {}) {
  if (!isBrowser()) return;
  const token = getToken();
  if (!loggingOut) {
    loggingOut = true;
    revokeOnServer(token);
    clearSession();
    if (broadcast) {
      try {
        localStorage.setItem(LOGOUT_SIGNAL_KEY, String(Date.now()));
        localStorage.removeItem(LOGOUT_SIGNAL_KEY);
      } catch { /* ignore */ }
    }
    setTimeout(() => { loggingOut = false; }, 1500);
  }
  if (redirect && window.location.pathname !== "/login") {
    // replace(): the dashboard page is removed from this history slot, and the
    // full reload drops all in-memory data (React state, cached API results).
    window.location.replace("/login");
  }
}

/**
 * Keep a protected page honest: if the session is gone (logged out in another tab,
 * expired, or the page was restored from the Back/Forward cache) go to /login.
 * Returns a cleanup function.
 */
export function watchSession(onInvalid) {
  if (!isBrowser()) return () => {};
  const invalid = () => {
    if (!hasValidSession()) {
      clearSession();
      onInvalid ? onInvalid() : window.location.replace("/login");
    }
  };
  const onPageShow = () => invalid();               // includes bfcache restores (event.persisted)
  const onVisibility = () => { if (document.visibilityState === "visible") invalid(); };
  const onStorage = (e) => {
    if (e.key === LOGOUT_SIGNAL_KEY || (e.key === TOKEN_KEY && !e.newValue) || e.key === null) invalid();
  };
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("popstate", invalid);
  window.addEventListener("focus", invalid);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("storage", onStorage);
  const timer = setInterval(invalid, 60 * 1000);   // catches token expiry while idle on a page
  return () => {
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("popstate", invalid);
    window.removeEventListener("focus", invalid);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("storage", onStorage);
    clearInterval(timer);
  };
}
