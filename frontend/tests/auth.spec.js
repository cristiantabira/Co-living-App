import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('should have signup link on login page', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.locator('a:has-text("Sign up")');
    await expect(signupLink).toBeVisible();
  });

  test('should display signup form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[type="text"]')).toBeVisible(); // name
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign up")')).toBeVisible();
  });

  test('should reject empty login credentials', async ({ page }) => {
    await page.goto('/login');
    const loginButton = page.locator('button:has-text("Login")');
    await loginButton.click();
    // Check for validation or error message
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Navigation', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should have login and signup as public routes', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    await page.goto('/signup');
    await expect(page).toHaveURL('/signup');
  });
});
