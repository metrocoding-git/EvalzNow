# EvalzNow web app – Security & Performance update

UI and calculations unchanged (screenshots of 12 screens compared old vs new: < 0.07 % pixel
difference, only icon anti-aliasing).

## Logout behaviour (src/lib/auth.js)
* **Log Out**, 30-minute idle timeout, expired/revoked token → session ends.
* **Back button** after logout never shows dashboard pages (history entry replaced, dashboard
  hidden until the session is verified, Back/Forward-cache restores re-checked, `no-store` headers).
* Opening the **home page** or the **login page** while signed in ends the session.
* Logout in one tab signs out **every open tab**.
* The token is **revoked on the server** (`POST /account/logout`), so a copied token is useless.
* Any API 401 (expired/revoked) signs the user out automatically.

## Other security
* Security headers on every page: Content-Security-Policy, X-Frame-Options DENY, nosniff,
  Referrer-Policy, Permissions-Policy, HSTS (production). `X-Powered-By` removed.
* Removed the dummy `/api/auth/login` route (hard-coded admin/1234).

## Performance
* Excel/PDF/image export libraries (~1.4 MB) load on demand → analytics pages ship 60–67 % less JS
  (e.g. Proficiency Metrics 778 KB → 255 KB first-load JS).
* Debug `console.log` removed from production build; unused Geist font download removed;
  `optimizePackageImports` for icon/chart libraries; unused three.js import removed.
* Oversized images resized (same file names): favicon 2.3 MB → 124 KB, welcome/loading images
  3.6 MB → 0.1 MB, ribbon icons 573 KB → 183 KB, landing banners −25 %.
* Browser caching for static images/PDFs.
* `framer-motion` added to package.json (it was used but missing → clean installs failed).

## Tests (Playwright)
```
npm run build && npm start            # API must be running too
npm run test:e2e                      # logout / session / headers / every screen loads
npm run test:speed                    # throttled 10 Mbit/s old-vs-new comparison (needs both stacks)
```
Set `APP_URL`, `API_URL`, `CHROMIUM` env vars as needed. Results: `test-results/`.
