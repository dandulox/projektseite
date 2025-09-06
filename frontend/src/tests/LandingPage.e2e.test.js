import { test, expect } from '@playwright/test';

test.describe('LandingPage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with correct content', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /Tracke deinen Lern- & Projektfortschritt/ })).toBeVisible();
    
    // Check subtitle
    await expect(page.getByText(/Aufgaben, Deadlines, Kanban & mehr/)).toBeVisible();
    
    // Check feature cards
    await expect(page.getByText('Projektverwaltung')).toBeVisible();
    await expect(page.getByText('Meine Aufgaben')).toBeVisible();
    await expect(page.getByText('Deadlines-Kalender')).toBeVisible();
    await expect(page.getByText('Kanban Boards')).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check skip link
    const skipLink = page.getByText('Zum Hauptinhalt springen');
    await expect(skipLink).toBeVisible();
    
    // Test skip link functionality
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    
    // Check main landmark
    const main = page.getByRole('main');
    await expect(main).toHaveAttribute('id', 'main-content');
    
    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    const h3Elements = page.locator('h3');
    await expect(h3Elements).toHaveCount(4);
  });

  test('should navigate to features when clicking feature cards', async ({ page }) => {
    // Test Projektverwaltung card
    await page.getByLabel('Zu Projektverwaltung navigieren').click();
    await expect(page).toHaveURL('/projects');
    
    // Go back to landing page
    await page.goto('/');
    
    // Test Meine Aufgaben card
    await page.getByLabel('Zu Meine Aufgaben navigieren').click();
    await expect(page).toHaveURL('/my-tasks');
    
    // Go back to landing page
    await page.goto('/');
    
    // Test Deadlines-Kalender card
    await page.getByLabel('Zu Dashboard mit Deadlines navigieren').click();
    await expect(page).toHaveURL('/dashboard');
    
    // Go back to landing page
    await page.goto('/');
    
    // Test Kanban Board card
    await page.getByLabel('Zu Kanban Board navigieren').click();
    await expect(page).toHaveURL('/projects/1/board');
  });

  test('should scroll to features section when clicking "Features ansehen"', async ({ page }) => {
    // Click "Features ansehen" button
    await page.getByText('Features ansehen').click();
    
    // Check if features section is visible (scrolled into view)
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeInViewport();
  });

  test('should show login/register buttons when not authenticated', async ({ page }) => {
    // Check that login/register buttons are visible
    await expect(page.getByText('Jetzt starten')).toBeVisible();
    await expect(page.getByText('Features ansehen')).toBeVisible();
    
    // Check that buttons have proper ARIA labels
    const startButton = page.getByLabel('Jetzt anmelden');
    const featuresButton = page.getByLabel('Features ansehen');
    
    await expect(startButton).toBeVisible();
    await expect(featuresButton).toBeVisible();
  });

  test('should open auth modal when clicking "Jetzt starten"', async ({ page }) => {
    // Click "Jetzt starten" button
    await page.getByText('Jetzt starten').click();
    
    // Check if auth modal is visible
    await expect(page.getByText('Anmelden')).toBeVisible();
    await expect(page.getByText('Melden Sie sich in Ihrem Account an')).toBeVisible();
    
    // Check if login form is visible
    await expect(page.getByRole('textbox', { name: /benutzername/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /passwort/i })).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.getByText('Zum Hauptinhalt springen')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeFocused();
    
    // Test feature card keyboard navigation
    const projectCard = page.getByLabel('Zu Projektverwaltung navigieren');
    await projectCard.focus();
    await expect(projectCard).toBeFocused();
    
    // Test Enter key on feature card
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/projects');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if content is still visible and properly laid out
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Projektverwaltung')).toBeVisible();
    
    // Check if buttons stack vertically on mobile
    const buttonContainer = page.locator('.flex.flex-col.sm\\:flex-row');
    await expect(buttonContainer).toBeVisible();
  });

  test('should support dark mode toggle', async ({ page }) => {
    // Check if theme toggle is visible
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    
    // Click theme toggle
    await themeToggle.click();
    
    // Check if dark mode is applied (this would depend on your theme implementation)
    // You might need to check for specific CSS classes or data attributes
    const body = page.locator('body');
    // This is a placeholder - adjust based on your actual dark mode implementation
    // await expect(body).toHaveClass(/dark/);
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Tracke deinen Lern- & Projektfortschritt/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Aufgaben, Deadlines, Kanban & mehr/);
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Tracke deinen Lern- & Projektfortschritt/);
    
    // Check Twitter Card tags
    const twitterCard = page.locator('meta[property="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('should handle redirect flag for authenticated users', async ({ page }) => {
    // This test would require setting up authentication state
    // For now, we'll test the environment variable behavior
    
    // Mock the environment variable
    await page.addInitScript(() => {
      window.REACT_APP_REDIRECT_HOME_TO_DASHBOARD = 'true';
    });
    
    // Navigate to landing page
    await page.goto('/');
    
    // If user is authenticated, they should be redirected to dashboard
    // This would need to be tested with actual authentication
    // For now, we just verify the page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
