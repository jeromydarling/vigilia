/**
 * Explore what's actually accessible through the demo bypass.
 */
import { test } from '@playwright/test';

const BASE = 'http://localhost:5173/vigilia';
const DEMO = `${BASE}/demo?bypass=vigilia&role=admin`;

test('explore demo app', async ({ page }) => {
  // Enter demo
  await page.goto(DEMO);
  await page.waitForTimeout(5000);

  console.log('After bypass URL:', page.url());

  // Screenshot whatever we land on
  await page.screenshot({ path: '/tmp/demo-1-landing.png', fullPage: false });

  // Try navigating to the tenant app directly
  await page.goto(`${BASE}/community-tech-alliance`);
  await page.waitForTimeout(3000);
  console.log('Tenant root URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-2-tenant.png', fullPage: false });

  // Try visits page
  await page.goto(`${BASE}/community-tech-alliance/visits`);
  await page.waitForTimeout(3000);
  console.log('Visits URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-3-visits.png', fullPage: false });

  // Try residents
  await page.goto(`${BASE}/community-tech-alliance/residents`);
  await page.waitForTimeout(3000);
  console.log('Residents URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-4-residents.png', fullPage: false });

  // Try family portal
  await page.goto(`${BASE}/community-tech-alliance/family`);
  await page.waitForTimeout(3000);
  console.log('Family URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-5-family.png', fullPage: false });

  // Try diocese report
  await page.goto(`${BASE}/community-tech-alliance/reports/diocese`);
  await page.waitForTimeout(3000);
  console.log('Diocese URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-6-diocese.png', fullPage: false });

  // Try volunteer portal
  await page.goto(`${BASE}/community-tech-alliance/volunteers/parish`);
  await page.waitForTimeout(3000);
  console.log('Volunteers URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-7-volunteers.png', fullPage: false });

  // Try dashboard
  await page.goto(`${BASE}/community-tech-alliance/dashboard`);
  await page.waitForTimeout(3000);
  console.log('Dashboard URL:', page.url());
  await page.screenshot({ path: '/tmp/demo-8-dashboard.png', fullPage: false });
});
