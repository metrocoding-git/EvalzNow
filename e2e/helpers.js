const API = process.env.API_URL || 'http://localhost:4000/api/v1';
const PASSWORD = process.env.TEST_PASSWORD || 'Test@12345';

async function login(page, username = 'admina@test.com', password = PASSWORD) {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/welcome');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/dashboard/control-view/**');
  return page.evaluate(() => localStorage.getItem('token'));
}

async function apiStatus(request, token, path = '/clients') {
  const r = await request.get(API + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return r.status();
}

module.exports = { API, PASSWORD, login, apiStatus };
