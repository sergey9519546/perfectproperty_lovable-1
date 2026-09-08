import { test, expect } from '@playwright/test';

test.describe('Critical Path: Auth, Sheriff Sales Dashboard, Address Search & Underwriting Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the authentication page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
  });

  test('Step 1 & 2: User can authenticate and navigate to Sheriff Sales dashboard', async ({ page }) => {
    // 1. Authenticate via Demo Analyst Session
    const demoButton = page.getByRole('button', { name: /Launch Demo Analyst Session/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
    } else {
      // Fallback: fill email and password if form is in credentials view
      await page.locator('#auth-email').fill('analyst@perfectproperty.com');
      await page.locator('#auth-password').fill('DemoPass123!');
      await page.getByRole('button', { name: /Sign in/i }).click();
    }

    // Wait for authentication and redirection to resolve
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });

    // 2. Navigate directly to /sheriff-sales
    await page.goto('/sheriff-sales');
    await page.waitForLoadState('networkidle');

    // 3. Verify Sheriff Sales Dashboard Header & Elements are present
    await expect(page.locator('text=Upcoming Sheriff & Foreclosure Auctions')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#sheriff-sales-address-search-input')).toBeVisible();
    await expect(page.locator('#county-filter-trigger')).toBeVisible();
    await expect(page.locator('#asset-class-filter-trigger')).toBeVisible();
    await expect(page.locator('#sheriff-sales-table-card')).toBeVisible();
  });

  test('Step 3: Perform address search and filter validation on live auction roster', async ({ page }) => {
    // Authenticate and load sheriff sales page
    const demoButton = page.getByRole('button', { name: /Launch Demo Analyst Session/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
    }
    await page.goto('/sheriff-sales');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('#sheriff-sales-address-search-input');
    await expect(searchInput).toBeVisible();

    // Perform search by specific address/street name
    await searchInput.fill('Summit');
    await page.waitForTimeout(300);

    // Verify filtered table results
    const tableRows = page.locator('#sheriff-sales-table-card tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Verify that the rendered row contains the searched keyword
    const firstRowText = await tableRows.first().textContent();
    expect(firstRowText?.toLowerCase()).toContain('summit');

    // Test search clear button
    const clearButton = page.locator('#sheriff-sales-address-search-clear-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('Step 4: Trigger AI Underwriting Score Analysis and inspect MAB valuation modal', async ({ page }) => {
    // Authenticate and load sheriff sales page
    const demoButton = page.getByRole('button', { name: /Launch Demo Analyst Session/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
    }
    await page.goto('/sheriff-sales');
    await page.waitForLoadState('networkidle');

    // Locate the first Analyze button in the auction table
    const analyzeButtons = page.locator('button[id^="analyze-sale-btn-"]');
    await expect(analyzeButtons.first()).toBeVisible({ timeout: 10000 });
    await analyzeButtons.first().click();

    // Verify the Underwriting Modal opens
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.locator('text=INSTANT UNDERWRITING REPORT')).toBeVisible();

    // Verify core calculated metrics inside the report
    await expect(dialog.locator('text=Underwriting Score')).toBeVisible({ timeout: 7000 });
    await expect(dialog.locator('text=Max Allowable Bid (MAB)')).toBeVisible();
    await expect(dialog.locator('text=Modeled Net Margin')).toBeVisible();
    await expect(dialog.locator('text=AI Underwriter Summary & Investment Thesis')).toBeVisible();

    // Test tab interactions within the modal
    const financialTab = dialog.getByRole('tab', { name: /Financials & MAB/i });
    if (await financialTab.isVisible()) {
      await financialTab.click();
      await expect(dialog.locator('text=70% ARV Ceiling Rule')).toBeVisible();
    }

    const liensTab = dialog.getByRole('tab', { name: /Surviving Liens/i });
    if (await liensTab.isVisible()) {
      await liensTab.click();
      await expect(dialog.locator('text=Municipal Tax & Senior Lien Exposure')).toBeVisible();
    }

    // Close the dialog using Escape or Close button
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
