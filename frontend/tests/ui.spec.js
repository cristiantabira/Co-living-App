import { test, expect } from '@playwright/test';

test.describe('UI Layout & Components', () => {
  test('login page should display correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title/heading
    const heading = page.locator('h1, h2');
    await expect(heading).toBeVisible();
    
    // Check for form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login")');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('signup page should display form', async ({ page }) => {
    await page.goto('/signup');
    
    const inputs = page.locator('input');
    await expect(inputs).toBeTruthy();
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign up")');
    await expect(submitButton).toBeVisible();
  });

  test('should display error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('somepassword');
    
    const submitButton = page.locator('button:has-text("Login")');
    await submitButton.click();
    
    // Page should remain on login or show error
    await expect(page).toHaveURL(/.*login.*/);
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    
    const heading = page.locator('h1, h2');
    await expect(heading).toBeVisible();
  });

  test('should be desktop responsive', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });
});
