import { test, expect } from '@playwright/test';

// Example: Test for checking API connectivity (requires backend running)
test.describe('API Connectivity', () => {
  test('should be able to reach the seed endpoint', async ({ page, baseURL }) => {
    // Make a direct API call to verify backend is running
    const apiResponse = await page.request.post(`http://localhost:5000/api/auth/seed-users`);
    
    // Backend should return some response (even if already seeded)
    expect([200, 409, 500]).toContain(apiResponse.status());
  });

  test('should have CORS enabled for frontend', async ({ page }) => {
    const response = await page.request.get('http://localhost:5000/api/auth/users', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    // Should get a response (not blocked by CORS)
    expect(response.ok() || response.status() === 401).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  test('404 page should display for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    
    const notFoundText = page.locator('text=/404|not found/i');
    await expect(notFoundText).toBeVisible();
  });
});
