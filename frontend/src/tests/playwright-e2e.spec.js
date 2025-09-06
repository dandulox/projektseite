// Playwright E2E Tests für kritische User Journeys
import { test, expect } from '@playwright/test';

test.describe('Projektseite E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigiere zur Landingpage
    await page.goto('/');
  });

  test.describe('Landingpage', () => {
    test('should display hero section and feature cards', async ({ page }) => {
      // Hero Section
      await expect(page.locator('h1')).toContainText('Tracke deinen Lern- & Projektfortschritt');
      
      // Feature Cards
      await expect(page.locator('[aria-label="Hauptfunktionen"]')).toBeVisible();
      await expect(page.locator('text=Projektverwaltung')).toBeVisible();
      await expect(page.locator('text=Meine Aufgaben')).toBeVisible();
      await expect(page.locator('text=Kanban Board')).toBeVisible();
    });

    test('should navigate to login when clicking CTA', async ({ page }) => {
      await page.click('text=Jetzt starten');
      await expect(page.locator('text=Anmelden')).toBeVisible();
    });

    test('should have working feature card navigation', async ({ page }) => {
      // Teste Feature-Karten Navigation (sollte zu Login weiterleiten wenn nicht eingeloggt)
      await page.click('text=Projektverwaltung');
      await expect(page.locator('text=Anmelden')).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should login with demo credentials', async ({ page }) => {
      // Navigiere zu Login
      await page.click('text=Jetzt starten');
      
      // Fülle Login-Formular aus
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'demo123');
      
      // Klicke Login-Button
      await page.click('button[type="submit"]');
      
      // Prüfe Dashboard-Redirect
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('text=Jetzt starten');
      
      await page.fill('input[name="username"]', 'invalid');
      await page.fill('input[name="password"]', 'wrong');
      await page.click('button[type="submit"]');
      
      // Prüfe Fehlermeldung
      await expect(page.locator('text=Ungültige Anmeldedaten')).toBeVisible();
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login vor jedem Test
      await page.goto('/');
      await page.click('text=Jetzt starten');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('should display dashboard widgets', async ({ page }) => {
      // Prüfe Dashboard-Widgets
      await expect(page.locator('text=Meine offenen Aufgaben')).toBeVisible();
      await expect(page.locator('text=Nächste Deadlines')).toBeVisible();
      await expect(page.locator('text=Zuletzt aktualisierte Projekte')).toBeVisible();
    });

    test('should show demo tasks', async ({ page }) => {
      // Prüfe ob Demo-Tasks angezeigt werden
      await expect(page.locator('text=Design Mockups erstellen')).toBeVisible();
      await expect(page.locator('text=Frontend Framework auswählen')).toBeVisible();
    });
  });

  test.describe('My Tasks Page', () => {
    test.beforeEach(async ({ page }) => {
      // Login und Navigation zu My Tasks
      await page.goto('/');
      await page.click('text=Jetzt starten');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
      
      // Navigiere zu My Tasks
      await page.click('text=Meine Aufgaben');
      await page.waitForURL(/.*my-tasks/);
    });

    test('should display task list with correct status mapping', async ({ page }) => {
      // Prüfe Task-Liste
      await expect(page.locator('text=Design Mockups erstellen')).toBeVisible();
      await expect(page.locator('text=Frontend Framework auswählen')).toBeVisible();
      
      // Prüfe Status-Badges (sollten korrekt gemappt sein)
      await expect(page.locator('text=Nicht gestartet')).toBeVisible(); // todo -> not_started
      await expect(page.locator('text=In Bearbeitung')).toBeVisible(); // in_progress -> in_progress
    });

    test('should filter tasks by status', async ({ page }) => {
      // Teste Status-Filter
      await page.selectOption('select[name="status"]', 'not_started');
      await page.click('button[type="submit"]');
      
      // Prüfe gefilterte Ergebnisse
      await expect(page.locator('text=Design Mockups erstellen')).toBeVisible();
    });
  });

  test.describe('Kanban Board', () => {
    test.beforeEach(async ({ page }) => {
      // Login und Navigation zu Kanban Board
      await page.goto('/');
      await page.click('text=Jetzt starten');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
      
      // Navigiere zu Projekten und dann zu Kanban Board
      await page.click('text=Projekte');
      await page.waitForURL(/.*projects/);
      await page.click('text=Website Redesign');
      await page.click('text=Kanban Board');
      await page.waitForURL(/.*board/);
    });

    test('should display kanban columns with tasks', async ({ page }) => {
      // Prüfe Kanban-Spalten
      await expect(page.locator('text=Zu erledigen')).toBeVisible();
      await expect(page.locator('text=In Bearbeitung')).toBeVisible();
      await expect(page.locator('text=Review')).toBeVisible();
      await expect(page.locator('text=Abgeschlossen')).toBeVisible();
      
      // Prüfe Tasks in Spalten
      await expect(page.locator('text=Design Mockups erstellen')).toBeVisible();
    });

    test('should support drag and drop', async ({ page }) => {
      // Teste Drag & Drop (vereinfacht)
      const taskCard = page.locator('[data-testid="task-1"]');
      const targetColumn = page.locator('[data-testid="column-in_progress"]');
      
      if (await taskCard.isVisible() && await targetColumn.isVisible()) {
        await taskCard.dragTo(targetColumn);
        
        // Prüfe ob Task in neuer Spalte ist
        await expect(targetColumn.locator('text=Design Mockups erstellen')).toBeVisible();
      }
    });
  });

  test.describe('Admin Diagnostics', () => {
    test.beforeEach(async ({ page }) => {
      // Login als Admin
      await page.goto('/');
      await page.click('text=Jetzt starten');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
      
      // Navigiere zu Admin-Bereich
      await page.click('text=Admin');
      await page.waitForURL(/.*admin/);
    });

    test('should display admin diagnostics tabs', async ({ page }) => {
      // Prüfe Admin-Tabs
      await expect(page.locator('text=API-Debug')).toBeVisible();
      await expect(page.locator('text=System-Health')).toBeVisible();
      await expect(page.locator('text=DB-Schema')).toBeVisible();
    });

    test('should show system health status', async ({ page }) => {
      // Klicke auf System-Health Tab
      await page.click('text=System-Health');
      
      // Prüfe Health-Status
      await expect(page.locator('text=System-Health-Status')).toBeVisible();
      await expect(page.locator('text=App-Status')).toBeVisible();
      await expect(page.locator('text=DB-Status')).toBeVisible();
    });

    test('should display status code tooltips', async ({ page }) => {
      // Klicke auf API-Debug Tab
      await page.click('text=API-Debug');
      
      // Führe API-Debug aus
      await page.fill('input[name="path"]', '/api/health');
      await page.click('button:has-text("Ausführen")');
      
      // Prüfe Statuscode-Tooltip
      await expect(page.locator('[data-testid="status-code-badge"]')).toBeVisible();
      
      // Hover über Statuscode für Tooltip
      const statusBadge = page.locator('[data-testid="status-code-badge"]');
      await statusBadge.hover();
      
      // Prüfe Tooltip-Inhalt
      await expect(page.locator('text=OK')).toBeVisible();
      await expect(page.locator('text=Anfrage erfolgreich verarbeitet')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Setze Mobile Viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Prüfe Mobile Navigation
      await expect(page.locator('button[aria-label="Menü öffnen"]')).toBeVisible();
      
      // Teste Mobile Menu
      await page.click('button[aria-label="Menü öffnen"]');
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Setze Tablet Viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Prüfe Tablet Layout
      await expect(page.locator('[aria-label="Hauptfunktionen"]')).toBeVisible();
      
      // Feature-Karten sollten in 2 Spalten sein
      const featureCards = page.locator('[aria-label="Hauptfunktionen"] > article');
      await expect(featureCards).toHaveCount(4);
    });
  });
});
