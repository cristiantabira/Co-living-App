# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-history.spec.js >> Expense history displays correctly after fix
- Location: tests\verify-history.spec.js:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Conectare")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: Co-Living App
    - navigation [ref=e6]:
      - generic [ref=e7] [cursor=pointer]:
        - generic [ref=e8]: 🏠
        - text: Dashboard
      - generic [ref=e9] [cursor=pointer]:
        - generic [ref=e10]: 📊
        - text: Istoric Cheltuieli
      - generic [ref=e11] [cursor=pointer]:
        - generic [ref=e12]: 👤
        - text: Profilul Meu
      - generic [ref=e13] [cursor=pointer]:
        - generic [ref=e14]: 🏢
        - text: Admin Complex
      - generic [ref=e15] [cursor=pointer]:
        - generic [ref=e16]: 👥
        - text: Gestionare Utilizatori
      - generic [ref=e17] [cursor=pointer]:
        - generic [ref=e18]: ⚙️
        - text: Administrare Spații
    - button "Logout" [ref=e20] [cursor=pointer]
  - main [ref=e21]:
    - generic [ref=e23]:
      - generic [ref=e25]:
        - heading "Istoric Cheltuieli 📊" [level=1] [ref=e26]
        - paragraph [ref=e27]: Istoricul cheltuielilor și datoriilor din apartamentul tău.
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e31]: ⬆️
            - generic [ref=e32]:
              - strong [ref=e33]: Dinner out
              - text: Plătit de tine
          - generic [ref=e34]:
            - generic [ref=e35]: 150 RON
            - generic [ref=e36]: "Ai de recuperat: 100.00 RON"
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]: ⬆️
            - generic [ref=e40]:
              - strong [ref=e41]: Dinner out
              - text: Plătit de tine
          - generic [ref=e42]:
            - generic [ref=e43]: 150 RON
            - generic [ref=e44]: "Ai de recuperat: 100.00 RON"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Expense history displays correctly after fix', async ({ page }) => {
  4  |   // 1. Go to login
  5  |   await page.goto('http://localhost:5173/login');
  6  |   
  7  |   // 2. Login
  8  |   await page.fill('input[type="email"]', 'cristian.tabira@yahoo.com');
  9  |   await page.fill('input[type="password"]', 'cacapaca');
> 10 |   await page.click('button:has-text("Conectare")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  11 |   
  12 |   // 3. Wait for redirect to dashboard
  13 |   await page.waitForURL('**/dashboard', { timeout: 10000 });
  14 |   
  15 |   // 4. Navigate to Activity page
  16 |   // Look for sidebar link to Activity (could be "Activitate", "Activity", "Istoric")
  17 |   const activityLink = page.locator('a:has-text("Activitate"), a:has-text("Activity"), a:has-text("Istoric")');
  18 |   if (await activityLink.isVisible()) {
  19 |     await activityLink.click();
  20 |   } else {
  21 |     // Fallback: go directly to route
  22 |     await page.goto('http://localhost:5173/activity');
  23 |   }
  24 |   
  25 |   // 5. Wait for page to load
  26 |   await page.waitForLoadState('networkidle');
  27 |   
  28 |   // 6. Check if expenses are displayed
  29 |   const pageText = await page.textContent('body');
  30 |   
  31 |   // Look for the expense we created ("Dinner out")
  32 |   const hasDinnerOut = pageText?.includes('Dinner out');
  33 |   const hasAmount = pageText?.includes('150');
  34 |   
  35 |   console.log('Page content loaded:', pageText?.substring(0, 300));
  36 |   console.log('Has "Dinner out":', hasDinnerOut);
  37 |   console.log('Has amount "150":', hasAmount);
  38 |   
  39 |   // Assert
  40 |   expect(hasDinnerOut).toBeTruthy();
  41 |   expect(hasAmount).toBeTruthy();
  42 |   
  43 |   console.log('✅ Expense history displays correctly!');
  44 | });
  45 | 
```