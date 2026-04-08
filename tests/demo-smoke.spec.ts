/**
 * Vigilia Demo Mode — Smoke tests via Playwright.
 *
 * Tests the homepage and demo gate flow with real Chromium.
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173/vigilia';

test.describe('Homepage', () => {
  test('loads and renders the marketing page', async ({ page }) => {
    await page.goto(BASE + '/');
    // Wait for React to hydrate
    await page.waitForLoadState('domcontentloaded');
    // The page should have the brand name
    await expect(page.locator('header').locator('text=Vigilia').first()).toBeVisible({ timeout: 10000 });
  });

  test('has the hero headline', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1').first()).toContainText('A liturgy', { timeout: 10000 });
  });

  test('has Try It Out link', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    // Should have a link containing "Try It Out" text
    const tryBtn = page.locator('a', { hasText: 'Try It Out' }).first();
    await expect(tryBtn).toBeVisible({ timeout: 10000 });
  });

  test('has Sign Up link', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const signUp = page.locator('a', { hasText: 'Sign Up' }).first();
    await expect(signUp).toBeVisible({ timeout: 10000 });
  });

  test('has navigation with section links', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('header nav').first();
    await expect(nav.locator('text=How It Works')).toBeVisible({ timeout: 10000 });
    await expect(nav.locator('text=The Journal')).toBeVisible();
    await expect(nav.locator('text=Platform')).toBeVisible();
    await expect(nav.locator('text=Pricing')).toBeVisible();
  });

  test('renders feature sections on scroll', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    // Scroll down to find feature content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    // Check for key marketing content
    await expect(page.locator('text=$499')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Demo Gate', () => {
  test('shows the contact form', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Try It Out')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input#demo-name')).toBeVisible();
    await expect(page.locator('input#demo-email')).toBeVisible();
  });

  test('shows all 5 role options', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Staff')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Chaplain')).toBeVisible();
    await expect(page.locator('text=Volunteer')).toBeVisible();
    // "Family" text appears in multiple places, be more specific
    await expect(page.locator('button', { hasText: 'Family' })).toBeVisible();
    await expect(page.locator('text=Administrator')).toBeVisible();
  });

  test('submit button is disabled without required fields', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled({ timeout: 10000 });
  });

  test('filling the form enables submit', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await page.fill('#demo-name', 'Test User');
    await page.fill('#demo-email', 'test@example.com');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  });

  test('bypass param redirects without showing form', async ({ page }) => {
    await page.goto(BASE + '/demo?bypass=vigilia');
    // Should not stay on the demo gate — should redirect
    await page.waitForTimeout(3000);
    const url = page.url();
    // Either redirected to the app or stayed on demo (if tenant doesn't exist)
    // The key test: the form should NOT be visible
    const formVisible = await page.locator('input#demo-name').isVisible().catch(() => false);
    expect(formVisible).toBe(false);
  });
});
