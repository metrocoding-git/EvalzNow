// Real-world speed test: old vs new app on a throttled "office broadband / 4G" connection
// (10 Mbit/s down, 3 Mbit/s up, 40 ms latency, browser cache disabled = first visit).
const { test } = require('@playwright/test');
const fs = require('fs');

const APPS = {
  before: { web: process.env.OLD_WEB || 'http://localhost:3100', api: process.env.OLD_API || 'http://localhost:4100/api/v1' },
  after: { web: process.env.NEW_WEB || 'http://localhost:3000', api: process.env.NEW_API || 'http://localhost:4000/api/v1' },
};
const USER = 'super@test.com';
const PASS = 'Test@12345';

async function throttle(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8,
  });
}

async function measure(page, isDashboard) {
  // "UI ready" = the screen is actually visible (images in the ribbon / page have finished loading)
  await page.waitForFunction((dash) => {
    const imgs = [...document.images];
    return document.readyState === 'complete' && imgs.length >= (dash ? 5 : 1) && imgs.every((i) => i.complete);
  }, isDashboard, { polling: 50, timeout: 60000 });
  const uiReadyMs = Math.round(await page.evaluate(() => performance.now()));
  return page.evaluate((ui) => {
    const n = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const sum = (f) => Math.round(res.filter(f).reduce((a, e) => a + (e.transferSize || 0), 0) / 1024);
    const before = res.filter((e) => e.responseEnd <= ui);
    return {
      uiReadyMs: ui,
      kbBeforeReady: Math.round(((n.transferSize || 0) / 1024) + before.reduce((a, e) => a + (e.transferSize || 0), 0) / 1024),
      loadMs: Math.round(n.loadEventEnd),
      domReadyMs: Math.round(n.domContentLoadedEventEnd),
      totalKB: Math.round(((n.transferSize || 0) / 1024)) + sum(() => true),
      jsKB: sum((e) => e.initiatorType === 'script' || /\.js(\?|$)/.test(e.name)),
      imageKB: sum((e) => e.initiatorType === 'img' || /\.(png|jpe?g|webp|avif|ico)(\?|$)/.test(e.name)),
    };
  }, uiReadyMs);
}

const PAGES = [
  ['Public home page', '/'],
  ['Login page', '/login'],
  ['Proficiency metrics', '/dashboard/analytics-view/proficiency-metrics'],
  ['Hybrid metrics', '/dashboard/analytics-view/hybrid-metrics'],
  ['Scoring trends', '/dashboard/analytics-view/scoring-trends'],
  ['Unit distributions', '/dashboard/analytics-view/unit-distributions'],
  ['Data reports', '/dashboard/analytics-view/data-reports'],
];

for (const [label, app] of Object.entries(APPS)) {
  test(`PERF-NET ${label}: page loads and report download on a 10 Mbit/s connection`, async ({ page }) => {
    test.setTimeout(300000);
    const out = { label, pages: [], api: [] };

    // public pages first (no session)
    for (const [name, path] of PAGES.slice(0, 2)) {
      await throttle(page);
      await page.goto(app.web + path, { waitUntil: 'load' });
      out.pages.push({ name, ...(await measure(page, false)) });
    }

    // log in (unthrottled) then measure dashboard pages
    const r = await fetch(`${app.api}/account`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: USER, password: PASS }) });
    const { token, user } = await r.json();
    // put the session in storage before any page script runs (avoids racing the login page)
    await page.context().addInitScript(([t, u]) => {
      localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); sessionStorage.setItem('activeClientId', '2');
    }, [token, user]);
    for (const [name, path] of PAGES.slice(2)) {
      await throttle(page);
      await page.goto(app.web + path, { waitUntil: 'load' });
      out.pages.push({ name, ...(await measure(page, true)) });
    }

    // API downloads through the throttled browser connection
    await throttle(page);
    for (const [name, path] of [
      ['Unit data report', '/data-report/unit-level/1'],
      ['Insert scores for a unit', '/insert-score/unit/1'],
      ['Candidate list', '/candidates/2'],
      ['Proficiency table', '/tabulation/proficiency?unitId=1&candidate_id=1,2,3'],
    ]) {
      const m = await page.evaluate(async ([url, t]) => {
        const s = performance.now();
        const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
        const body = await res.text();
        const entry = performance.getEntriesByName(url).pop();
        return { ms: Math.round(performance.now() - s), status: res.status, transferredKB: Math.round((entry?.transferSize || body.length) / 1024), dataKB: Math.round(body.length / 1024) };
      }, [app.api + path, token]);
      out.api.push({ name, ...m });
    }

    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(`test-results/network-${label}.json`, JSON.stringify(out, null, 1));
    console.log(JSON.stringify(out, null, 1));
  });
}
