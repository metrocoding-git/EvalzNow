// New work (Oct 2026): Effectivity menu, Extract Cognitive Matrix, Framework Age.
// Needs a unit with scores in sessionStorage "selectedUnitId" (E2E_UNIT_ID, default 3).
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

const UNIT = process.env.E2E_UNIT_ID || '3';

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.evaluate((u) => sessionStorage.setItem('selectedUnitId', u), UNIT);
});

test('Effectivity menu shows the table, parameter charts and type pie', async ({ page }) => {
  await page.goto('/dashboard/analytics-view/effectivity');
  await expect(page.getByText('Effectivity Table').first()).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('columnheader', { name: 'Parameter 01' })).toBeVisible();
  await page.getByText('Effectivity - Parameter 01 vs. PP ID').click();
  await expect(page.locator('.recharts-wrapper')).toBeVisible();
  await page.getByText('Effectivity Type Tracking').click();
  await page.locator('select').filter({ hasText: 'Unit Level' }).selectOption('activateUnitLevel');
  await page.getByText('Effectivity - Parameter 02 vs. PP ID').click();
  await expect(page.locator('.recharts-wrapper')).toBeVisible();
});

test('Effectivity Object (+) saves the drop-down categories', async ({ page }) => {
  await page.goto('/dashboard/analytics-view/effectivity');
  await expect(page.getByText('Effectivity Table').first()).toBeVisible({ timeout: 60000 });
  await page.getByTitle('Add Effectivity Object').click();
  await page.locator('select:has(option:text("Select PP ID"))').selectOption({ index: 1 });
  await page.locator('select:has(option:text("Select Effectivity Type"))').selectOption('Holistic');
  await page.getByRole('button', { name: /^(Save|Update)$/ }).click();
  await expect(page.getByText('Effectivity Object', { exact: true })).toBeHidden();
});

test('Neuroscience Tools extracts the cognitive matrix of the unit', async ({ page }) => {
  await page.goto('/dashboard/analytics-view/neuroscience-tools');
  const button = page.getByRole('button', { name: 'Extract Cognitive Matrix' });
  await expect(button).toBeEnabled({ timeout: 60000 });
  const [download] = await Promise.all([page.waitForEvent('download'), button.click()]);
  expect(download.suggestedFilename()).toMatch(/^Cognitive_Matrix_.*\.xlsx$/);
});

test('Create Unit asks for Framework Age only for Classroom', async ({ page }) => {
  await page.goto('/dashboard/control-view/unit');
  await expect(page.getByText(/Units \(\d+\)/)).toBeVisible({ timeout: 60000 });
  await page.locator('button:has(svg.lucide-plus)').first().click();
  await expect(page.getByText('Create Unit')).toBeVisible();
  const env = page.locator('select:has(option:text("Select Environment"))');
  await env.selectOption('Workforce');
  await expect(page.getByText('Framework Age (Years):')).toHaveCount(0);
  await env.selectOption('Classroom');
  await expect(page.getByText('Framework Age (Years):')).toBeVisible();
});
