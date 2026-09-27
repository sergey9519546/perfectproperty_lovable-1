# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sheriff-sales.spec.ts >> Critical Path: Auth, Sheriff Sales Dashboard, Address Search & Underwriting Analysis >> Step 4: Trigger AI Underwriting Score Analysis and inspect MAB valuation modal
- Location: e2e/sheriff-sales.spec.ts:71:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[id^="analyze-sale-btn-"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('button[id^="analyze-sale-btn-"]').first() with timeout 10000ms
  - waiting for locator('button[id^="analyze-sale-btn-"]').first()

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "Perfect Property Home":
    - /url: /
    - text: PERFECT PROPERTY
  - navigation "Primary Navigation":
    - 'link "Deals: Ranked investment deals, wholesale spreads & underwriting"':
      - /url: /deals
      - text: Deals
    - 'link "Map: Interactive parcel map, cadastral boundary & comps radius"':
      - /url: /workspace
      - text: Map
    - 'link "Auctions: AI-scored foreclosure & sheriff auction pipeline"':
      - /url: /sheriff-sales
      - text: Auctions AI Scored
    - 'link "Pricing: Subscription plans with 30-day money-back guarantee"':
      - /url: /pricing
      - text: Pricing Guarantee
    - button "More Advanced Analysis & Operations Tools": More Tools
  - 'status "System status: Real-time cadastral and public records feed active"': Live Feed
- main:
  - link "Perfect Property home":
    - /url: /
    - text: PERFECT PROPERTY
  - text: Investment intelligence, with evidence.
  - heading "See the opportunity. Trace every signal." [level=1]
  - paragraph: Access calibrated market scores, ranked deals, source lineage, and underwriting actions in one unified institutional workspace.
  - text: Private & Row-Level Secured Audited Source Provenance Platform Access
  - button "Sign In"
  - button "Create Account"
  - heading "Sign in to workspace" [level=1]
  - paragraph: Access institutional deal memos, calibrated underwriting, and map intelligence.
  - text: Instant Demo Analyst Access
  - paragraph: Explore live parcels, underwriting models, and pipeline scoring with our pre-configured analyst account.
  - button "Launch Demo Analyst Session"
  - text: or credentials Email address
  - textbox "Email address":
    - /placeholder: you@company.com
  - text: Password
  - textbox "Password":
    - /placeholder: At least 6 characters
  - button "Sign in with Email"
  - button "Continue with Google"
  - paragraph:
    - text: By continuing, you agree to PERFECTPROPERTY LLC's
    - link "Terms of Service":
      - /url: /terms
    - text: ","
    - link "Privacy Policy":
      - /url: /privacy
    - text: ", and"
    - link "30-Day Refund Policy":
      - /url: /refunds
    - text: .
  - link "Back to Perfect Property":
    - /url: /
  - text: Role-Based Access Control
- region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Critical Path: Auth, Sheriff Sales Dashboard, Address Search & Underwriting Analysis', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Navigate directly to the authentication page
  6   |     await page.goto('/auth');
  7   |     await page.waitForLoadState('domcontentloaded');
  8   |   });
  9   | 
  10  |   async function performDemoLogin(page: any) {
  11  |     const demoButton = page.locator('#auth-launch-demo-btn');
  12  |     if (await demoButton.isVisible()) {
  13  |       await demoButton.click();
  14  |     } else {
  15  |       await page.locator('#auth-email').fill('analyst@perfectproperty.com');
  16  |       await page.locator('#auth-password').fill('DemoPass123!');
  17  |       await page.getByRole('button', { name: /Sign in with Email/i }).click();
  18  |     }
  19  |     await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
  20  |   }
  21  | 
  22  |   test('Step 1 & 2: User can authenticate and navigate to Sheriff Sales dashboard', async ({ page }) => {
  23  |     await performDemoLogin(page);
  24  | 
  25  |     await page.goto('/sheriff-sales');
  26  |     await page.waitForLoadState('domcontentloaded');
  27  | 
  28  |     await expect(page.locator('text=Upcoming Sheriff & Foreclosure Auctions')).toBeVisible({ timeout: 10000 });
  29  |     await expect(page.locator('#sheriff-sales-address-search-input')).toBeVisible();
  30  |     await expect(page.locator('#county-filter-trigger')).toBeVisible();
  31  |     await expect(page.locator('#asset-class-filter-trigger')).toBeVisible();
  32  |     await expect(page.locator('#sheriff-sales-table-card')).toBeVisible();
  33  |   });
  34  | 
  35  |   test('Step 3: Perform address search and filter validation on live auction roster', async ({ page }) => {
  36  |     await performDemoLogin(page);
  37  | 
  38  |     await page.goto('/sheriff-sales');
  39  |     await page.waitForLoadState('domcontentloaded');
  40  | 
  41  |     const searchInput = page.locator('#sheriff-sales-address-search-input');
  42  |     await expect(searchInput).toBeVisible();
  43  | 
  44  |     // Perform search by specific address/street name
  45  |     await searchInput.fill('Summit');
  46  |     await page.waitForTimeout(300);
  47  | 
  48  |     // Verify filtered table results
  49  |     const tableRows = page.locator('#sheriff-sales-table-card tbody tr');
  50  |     const rowCount = await tableRows.count();
  51  |     expect(rowCount).toBeGreaterThanOrEqual(1);
  52  | 
  53  |     // Verify that the rendered row contains the searched keyword
  54  |     const firstRowText = await tableRows.first().textContent();
  55  |     expect(firstRowText?.toLowerCase()).toContain('summit');
  56  | 
  57  |     // Test search clear button
  58  |     const clearButton = page.locator('#sheriff-sales-address-search-clear-btn');
  59  |     if (await clearButton.isVisible()) {
  60  |       await clearButton.click();
  61  |       await expect(searchInput).toHaveValue('');
  62  |     }
  63  |   });
  64  | 
  65  |   test('Step 4: Trigger AI Underwriting Score Analysis and inspect MAB valuation modal', async ({ page }) => {
  66  |     await performDemoLogin(page);
  67  | 
  68  |     await page.goto('/sheriff-sales');
  69  |     await page.waitForLoadState('domcontentloaded');
  70  | 
  71  |     // Locate the first Analyze button in the auction table
  72  |     const analyzeButtons = page.locator('button[id^="analyze-sale-btn-"]');
  73  |     await expect(analyzeButtons.first()).toBeVisible({ timeout: 10000 });
  74  |     await analyzeButtons.first().click();
  75  | 
  76  |     // Verify the Underwriting Modal opens
  77  |     const dialog = page.locator('[role="dialog"]');
  78  |     await expect(dialog).toBeVisible({ timeout: 5000 });
  79  |     await expect(dialog.locator('text=INSTANT UNDERWRITING REPORT')).toBeVisible();
  80  | 
  81  |     // Verify core calculated metrics inside the report
  82  |     await expect(dialog.locator('text=Underwriting Score')).toBeVisible({ timeout: 7000 });
> 83  |     await expect(dialog.locator('text=Max Allowable Bid (MAB)')).toBeVisible();
      |                                          ^ Error: expect(locator).toBeVisible() failed
  84  |     await expect(dialog.locator('text=Modeled Net Margin')).toBeVisible();
  85  |     await expect(dialog.locator('text=AI Underwriter Summary & Investment Thesis')).toBeVisible();
  86  | 
  87  |     // Test tab interactions within the modal
  88  |     const financialTab = dialog.getByRole('tab', { name: /Financials & MAB/i });
  89  |     if (await financialTab.isVisible()) {
  90  |       await financialTab.click();
  91  |       await expect(dialog.locator('text=70% ARV Ceiling Rule')).toBeVisible();
  92  |     }
  93  | 
  94  |     const liensTab = dialog.getByRole('tab', { name: /Surviving Liens/i });
  95  |     if (await liensTab.isVisible()) {
  96  |       await liensTab.click();
  97  |       await expect(dialog.locator('text=Municipal Tax & Senior Lien Exposure')).toBeVisible();
  98  |     }
  99  | 
  100 |     // Close the dialog using Escape or Close button
  101 |     await page.keyboard.press('Escape');
  102 |     await expect(dialog).not.toBeVisible();
  103 |   });
  104 | });
  105 | 
```