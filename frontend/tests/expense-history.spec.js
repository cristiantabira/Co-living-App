import { test, expect } from '@playwright/test';

test('Check if expense history loads after fix', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:5173');
  
  // Fill login form
  await page.fill('input[type="email"]', 'cristian.tabira@yahoo.com');
  await page.fill('input[type="password"]', 'cacapaca');
  
  // Click login
  await page.click('button:has-text("Conectare")');
  
  // Wait for navigation
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to Activity/History
  await page.click('a:has-text("Activitate"), a:has-text("Activity"), a:has-text("Istoric")');
  
  // Wait for history to load
  await page.waitForSelector('[style*="display"]', { timeout: 5000 });
  
  // Capture network response
  let historyResponse = null;
  page.on('response', response => {
    if (response.url().includes('/expenses/history')) {
      historyResponse = response;
    }
  });
  
  // Check if there's content
  const content = await page.textContent('body');
  console.log('Page content snippet:', content?.substring(0, 200));
  
  if (historyResponse) {
    const status = historyResponse.status();
    const data = await historyResponse.json();
    console.log('History API Response Status:', status);
    console.log('History count:', data?.length);
    console.log('First expense:', data?.[0]);
  }
});
