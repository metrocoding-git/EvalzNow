// Logout & session security (browser end-to-end tests)
const { test, expect } = require('@playwright/test');
const { login, apiStatus } = require('./helpers');

test.describe('Logout & session security', () => {
  test('SEC-UI-01 Dashboard cannot be opened without logging in', async ({ page }) => {
    await page.goto('/dashboard/control-view/unit');
    await page.waitForURL('**/login');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('SEC-UI-02 Login works and opens the dashboard', async ({ page, request }) => {
    const token = await login(page);
    expect(token).toBeTruthy();
    expect(await apiStatus(request, token)).toBe(200);
  });

  test('SEC-UI-03 Log Out ends the session on the server (old token rejected)', async ({ page, request }) => {
    const token = await login(page);
    await page.goto('/dashboard/settings');
    await page.getByRole('button', { name: 'Log Out' }).click();
    await page.waitForURL('**/login');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    // give the keepalive revoke request a moment
    await expect.poll(() => apiStatus(request, token), { timeout: 5000 }).toBe(401);
  });

  test('SEC-UI-04 Back button after logout does not show the dashboard', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/control-view/candidate');
    await page.goto('/dashboard/settings');
    await page.getByRole('button', { name: 'Log Out' }).click();
    await page.waitForURL('**/login');
    for (let i = 0; i < 3; i++) {
      await page.goBack().catch(() => {});
      await page.waitForTimeout(700);
      expect(page.url()).not.toMatch(/\/dashboard\//);
    }
    await expect(page.getByText('Candidate', { exact: true })).toHaveCount(0);
  });

  test('SEC-UI-05 Going Back from the app to the login page logs the user out', async ({ page, request }) => {
    const token = await login(page);
    // history: /login -> /welcome (replaced) -> /dashboard...
    await page.goto('/login');
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    await expect.poll(() => apiStatus(request, token), { timeout: 5000 }).toBe(401);
    await page.goto('/dashboard/control-view/unit');
    await page.waitForURL('**/login');
  });

  test('SEC-UI-06 Opening the site home page while signed in logs the user out', async ({ page, request }) => {
    const token = await login(page);
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    await expect.poll(() => apiStatus(request, token), { timeout: 5000 }).toBe(401);
  });

  test('SEC-UI-07 Logout in one tab signs out every open tab', async ({ context }) => {
    const tab1 = await context.newPage();
    await login(tab1);
    const tab2 = await context.newPage();
    await tab2.goto('/dashboard/control-view/unit');
    await tab2.waitForTimeout(500);
    expect(tab2.url()).toMatch(/\/dashboard\//);
    await tab1.goto('/dashboard/settings');
    await tab1.getByRole('button', { name: 'Log Out' }).click();
    await tab2.waitForURL('**/login', { timeout: 10000 });
  });

  test('SEC-UI-08 Idle for 30 minutes = automatic logout', async ({ page }) => {
    await page.clock.install();
    await login(page);
    await page.clock.fastForward('31:00');
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('SEC-UI-09 Expired / revoked token in the browser forces re-login', async ({ page }) => {
    await login(page);
    // simulate a tampered/expired token
    await page.evaluate(() => localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwIjoxfQ.x'));
    await page.goto('/dashboard/control-view/unit');
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('SEC-UI-10 Security headers on the web app', async ({ request }) => {
    const r = await request.get('/dashboard/control-view');
    const h = r.headers();
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['cache-control']).toContain('no-store');
    expect(h['x-powered-by']).toBeUndefined();
  });
});
