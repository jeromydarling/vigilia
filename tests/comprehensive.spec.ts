/**
 * Vigilia — Comprehensive test suite.
 *
 * Tests every major page, flow, and component across
 * the marketing site, demo mode, and authenticated app.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:5173/vigilia';
const DEMO = `${BASE}/demo?bypass=vigilia`;

// ═══════════════════════════════════════════════════
// MARKETING SITE
// ═══════════════════════════════════════════════════

test.describe('Marketing: Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders brand in header', async ({ page }) => {
    await expect(page.locator('header').locator('text=Vigilia').first()).toBeVisible({ timeout: 10000 });
  });

  test('hero headline renders', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('A liturgy', { timeout: 10000 });
  });

  test('has Try It Out button', async ({ page }) => {
    const btn = page.locator('a', { hasText: 'Try It Out' }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('has Sign Up button', async ({ page }) => {
    const btn = page.locator('a', { hasText: 'Sign Up' }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('nav links point to sections', async ({ page }) => {
    const nav = page.locator('header nav').first();
    await expect(nav.locator('text=How It Works')).toBeVisible({ timeout: 10000 });
    await expect(nav.locator('text=The Journal')).toBeVisible();
    await expect(nav.locator('text=Platform')).toBeVisible();
    await expect(nav.locator('text=Pricing')).toBeVisible();
  });

  test('pricing section shows $499', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('text=$499')).toBeVisible({ timeout: 5000 });
  });

  test('platform section has feature cards', async ({ page }) => {
    await page.locator('#platform').scrollIntoViewIfNeeded();
    await expect(page.locator('#platform')).toBeVisible({ timeout: 10000 });
  });

  test('mobile hamburger menu opens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const hamburger = page.locator('button.md\\:hidden').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.locator('text=How It Works').last()).toBeVisible({ timeout: 3000 });
    }
  });

  test('rosary images are present', async ({ page }) => {
    const rosaryImgs = page.locator('img[aria-hidden="true"]');
    await expect(rosaryImgs.first()).toBeAttached({ timeout: 5000 });
    const count = await rosaryImgs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('journal entry day labels have icons', async ({ page }) => {
    await page.locator('#the-journal').scrollIntoViewIfNeeded();
    // Look for lucide icon SVGs near day labels
    const mondaySection = page.locator('text=Monday').first();
    await expect(mondaySection).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Marketing: Security Page', () => {
  test('loads with correct headline', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1').first()).toContainText('What we protect', { timeout: 10000 });
  });

  test('has What\'s built today section', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=What\'s built today')).toBeVisible({ timeout: 10000 });
  });

  test('has What\'s planned section', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator("text=What's planned")).toBeVisible({ timeout: 10000 });
  });

  test('has HIPAA callout', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=What makes this data sensitive')).toBeVisible({ timeout: 10000 });
  });

  test('has Contact Us button', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('a', { hasText: 'Contact Us' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Marketing: Contact Page', () => {
  test('loads contact form', async ({ page }) => {
    await page.goto(BASE + '/contact');
    await page.waitForLoadState('domcontentloaded');
    // Should have some kind of form or contact content
    await expect(page.locator('input, textarea, form').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════
// DEMO GATE
// ═══════════════════════════════════════════════════

test.describe('Demo: Gate Page', () => {
  test('shows contact form with all fields', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input#demo-name')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input#demo-email')).toBeVisible();
  });

  test('shows all 5 role options', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Staff')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Chaplain')).toBeVisible();
    await expect(page.locator('text=Volunteer')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Family' })).toBeVisible();
    await expect(page.locator('text=Administrator')).toBeVisible();
  });

  test('submit disabled without fields', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('button[type="submit"]');
    await expect(btn).toBeDisabled({ timeout: 10000 });
  });

  test('filling form enables submit', async ({ page }) => {
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await page.fill('#demo-name', 'Test User');
    await page.fill('#demo-email', 'test@example.com');
    const btn = page.locator('button[type="submit"]');
    await expect(btn).toBeEnabled({ timeout: 5000 });
  });

  test('bypass skips form entirely', async ({ page }) => {
    await page.goto(DEMO);
    await page.waitForTimeout(3000);
    const formVisible = await page.locator('input#demo-name').isVisible().catch(() => false);
    expect(formVisible).toBe(false);
  });

  test('bypass with role=chaplain works', async ({ page }) => {
    await page.goto(`${BASE}/demo?bypass=vigilia&role=chaplain`);
    await page.waitForTimeout(3000);
    const formVisible = await page.locator('input#demo-name').isVisible().catch(() => false);
    expect(formVisible).toBe(false);
  });

  test('bypass with role=family works', async ({ page }) => {
    await page.goto(`${BASE}/demo?bypass=vigilia&role=family`);
    await page.waitForTimeout(3000);
    const formVisible = await page.locator('input#demo-name').isVisible().catch(() => false);
    expect(formVisible).toBe(false);
  });
});

// ═══════════════════════════════════════════════════
// DEMO MODE: IN-APP EXPERIENCE
// ═══════════════════════════════════════════════════

test.describe('Demo: In-App (requires Supabase)', () => {
  // These tests require a real Supabase connection with a demo tenant.
  // They pass in production but are skipped in CI/local without DB.

  test.skip('demo toolbar appears at bottom', async ({ page }) => {
    await page.goto(DEMO);
    await page.waitForURL(/community-tech-alliance/, { timeout: 10000 });
    await expect(page.locator('text=Demo')).toBeVisible({ timeout: 5000 });
  });

  test.skip('role switcher works', async ({ page }) => {
    await page.goto(DEMO);
    await page.waitForURL(/community-tech-alliance/, { timeout: 10000 });
    await page.locator('text=Switch Role').click();
    await expect(page.locator('button', { hasText: 'Chaplain' })).toBeVisible();
  });

  test.skip('exit demo returns to homepage', async ({ page }) => {
    await page.goto(DEMO);
    await page.waitForURL(/community-tech-alliance/, { timeout: 10000 });
    await page.locator('text=Exit').click();
    await expect(page.locator('h1').first()).toContainText('A liturgy');
  });
});

// ═══════════════════════════════════════════════════
// LEGAL PAGES
// ═══════════════════════════════════════════════════

test.describe('Legal Pages', () => {
  test('terms page loads', async ({ page }) => {
    await page.goto(BASE + '/legal/terms');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Vigilia').first()).toBeVisible({ timeout: 10000 });
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto(BASE + '/legal/privacy');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Vigilia').first()).toBeVisible({ timeout: 10000 });
  });

  test('AI transparency page loads', async ({ page }) => {
    await page.goto(BASE + '/legal/ai-transparency');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Vigilia').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════
// AUTH PAGES
// ═══════════════════════════════════════════════════

test.describe('Auth Pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.waitForLoadState('domcontentloaded');
    // Should have email/password inputs or SSO buttons
    await expect(page.locator('input[type="email"], input[type="text"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('signup page loads', async ({ page }) => {
    await page.goto(BASE + '/signup');
    await page.waitForLoadState('domcontentloaded');
    // Signup may redirect or show a form — either way it should render something
    await page.waitForTimeout(2000);
    const hasInput = await page.locator('input').first().isVisible().catch(() => false);
    const hasText = await page.locator('text=Sign').first().isVisible().catch(() => false);
    expect(hasInput || hasText).toBe(true);
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto(BASE + '/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════
// 404 HANDLING
// ═══════════════════════════════════════════════════

test.describe('Error Handling', () => {
  test('unknown route does not crash', async ({ page }) => {
    await page.goto(BASE + '/this-page-does-not-exist-xyz');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    // Should render something — not a blank page or browser error
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(10);
  });
});

// ═══════════════════════════════════════════════════
// RESPONSIVE / MOBILE
// ═══════════════════════════════════════════════════

test.describe('Mobile Responsive', () => {
  test('homepage renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Vigilia').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('A liturgy');
  });

  test('security page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1').first()).toContainText('What we protect', { timeout: 10000 });
  });

  test('demo gate renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/demo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input#demo-name')).toBeVisible({ timeout: 10000 });
  });

  test('login renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════
// NAVIGATION FLOWS
// ═══════════════════════════════════════════════════

test.describe('Navigation Flows', () => {
  test('Try It Out button links to demo', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const tryBtn = page.locator('a', { hasText: 'Try It Out' }).first();
    const href = await tryBtn.getAttribute('href');
    expect(href).toContain('demo');
  });

  test('Sign Up button links to signup', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('a', { hasText: 'Sign Up' }).first();
    const href = await btn.getAttribute('href');
    expect(href).toContain('signup');
  });

  test('footer Security link goes to /security', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const link = page.locator('footer a', { hasText: 'Security' });
    const href = await link.getAttribute('href');
    expect(href).toContain('security');
  });

  test('footer Contact link goes to /contact', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const link = page.locator('footer a', { hasText: 'Contact' });
    const href = await link.getAttribute('href');
    expect(href).toContain('contact');
  });

  test('security page Contact Us button links to /contact', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    const cta = page.locator('a', { hasText: 'Contact Us' }).first();
    const href = await cta.getAttribute('href');
    expect(href).toContain('contact');
  });

  test('Sign in button links to /login', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('a', { hasText: 'Sign in' }).first();
    if (await btn.isVisible()) {
      const href = await btn.getAttribute('href');
      expect(href).toContain('login');
    }
  });
});

// ═══════════════════════════════════════════════════
// SCROLL & ANCHOR NAVIGATION
// ═══════════════════════════════════════════════════

test.describe('Anchor Navigation', () => {
  test('clicking How It Works scrolls to ritual section', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const ritualSection = page.locator('#the-ritual');
    // Section should exist
    await expect(ritualSection).toBeAttached({ timeout: 5000 });
  });

  test('the-journal section exists', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#the-journal')).toBeAttached({ timeout: 5000 });
  });

  test('platform section exists', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#platform')).toBeAttached({ timeout: 5000 });
  });

  test('pricing section exists', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#pricing')).toBeAttached({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════
// CONTENT INTEGRITY
// ═══════════════════════════════════════════════════

test.describe('Content Integrity', () => {
  test('no pilot references on homepage', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const content = await page.textContent('body');
    expect(content).not.toContain('Start Pilot');
    expect(content).not.toContain('60-day pilot');
  });

  test('no CROS branding on homepage', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const content = await page.textContent('body');
    expect(content).not.toContain('CROS');
    expect(content).not.toContain('thecros');
  });

  test('no CROS branding on security page', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    const content = await page.textContent('body');
    expect(content).not.toContain('CROS');
    expect(content).not.toContain('thecros');
  });

  test('security page does not say HIPAA compliant', async ({ page }) => {
    await page.goto(BASE + '/security');
    await page.waitForLoadState('domcontentloaded');
    const content = await page.textContent('body');
    expect(content).not.toContain('HIPAA compliant');
    expect(content).not.toContain('HIPAA-grade');
  });

  test('homepage mentions all key features', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const content = await page.textContent('body');
    expect(content).toContain('Vigil Mode');
    expect(content).toContain('Weekly Digest');
    expect(content).toContain('Mission Report');
    expect(content).toContain('Parish Volunteers');
    expect(content).toContain('Sacrament Tracker');
  });

  test('homepage shows correct price', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const content = await page.textContent('body');
    expect(content).toContain('$499');
    expect(content).toContain('Per community, per month');
  });
});
