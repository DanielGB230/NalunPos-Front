import { test, expect } from '@playwright/test';

test.describe('NalunPos-Admin-Web Smoke Suite', () => {
  test('debe cargar la consola administrativa de login sin errores de runtime', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await expect(page).toHaveTitle(/NalunPos/i);
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#password-input')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('debe validar campos requeridos de administrador', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await expect(page.locator('text=correo electrónico válido')).toBeVisible();
  });

  test('debe autenticar SuperAdmin con mock route y redirigir al portal administrativo', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'jwt-admin-e2e-valid-mock',
          refreshToken: 'refresh-admin-e2e-mock',
          expiresIn: 3600,
          user: {
            id: 'admin-e2e-01',
            email: 'admin@nalunpos.com',
            fullName: 'Super Administrador E2E',
            role: 'SuperAdmin',
            tenantId: 'tenant-global-01',
            permissions: ['ADMIN_ALL'],
          },
        }),
      });
    });

    await page.goto('/login');
    await page.fill('#email-input', 'admin@nalunpos.com');
    await page.fill('#password-input', 'SuperPassword123!');
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/\/login/);
  });
});
