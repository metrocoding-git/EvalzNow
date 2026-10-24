// Every screen still loads correctly with the new security settings (no CSP / API errors),
// and page load timings are recorded for the performance report.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { login } = require('./helpers');

const PAGES = [
  '/dashboard/control-view/admin',
  '/dashboard/control-view/staff',
  '/dashboard/control-view/candidate',
  '/dashboard/control-view/unit',
  '/dashboard/setup-view/insert-scores',
  '/dashboard/analytics-view/scoring-trends',
  '/dashboard/analytics-view/tabulation-tables',
  '/dashboard/analytics-view/proficiency-metrics',
  '/dashboard/analytics-view/growth-metrics',
  '/dashboard/analytics-view/hybrid-metrics',
  '/dashboard/analytics-view/unit-distributions',
  '/dashboard/analytics-view/auxiliary-resultants',
  '/dashboard/analytics-view/neuroscience-tools',
  '/dashboard/analytics-view/effectivity',
  '/dashboard/analytics-view/global-analytics',
  '/dashboard/analytics-view/data-extractions',
  '/dashboard/analytics-view/data-reports',
  '/dashboard/settings',
];

for (const user of ['super@test.com', 'admina@test.com', 'staffa@test.com']) {
test(`PERF-UI / SEC-UI-11 All screens load without security-policy or permission errors (${user})`, async ({ page }) => {
  test.setTimeout(240000);
  const problems = [];
  page.on('console', (m) => {
    const t = m.text();
    if (/Content Security Policy|Refused to (load|connect|execute)/i.test(t)) problems.push(`${page.url()} :: ${t}`);
  });
  page.on('response', (r) => {
    if (r.url().includes('/api/v1/') && [401, 403, 500].includes(r.status())) problems.push(`${r.status()} ${r.url()}`);
  });

  await login(page, user);
  const timings = [];
  for (const p of PAGES) {
    await page.goto(p, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const nav = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'script');
      return {
        domContentLoaded: Math.round(n.domContentLoadedEventEnd),
        load: Math.round(n.loadEventEnd),
        scriptKB: Math.round(res.reduce((a, e) => a + (e.encodedBodySize || 0), 0) / 1024),
      };
    });
    expect(page.url()).toContain('/dashboard');
    timings.push({ page: p, ...nav });
  }
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync(`test-results/page-timings-${process.env.LABEL || 'run'}-${user.split('@')[0]}.json`, JSON.stringify(timings, null, 1));
  expect(problems, problems.join('\n')).toEqual([]);
});
}
