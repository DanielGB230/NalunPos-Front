import { test, expect } from '@playwright/test';

test.describe('NalunPos-Web Smoke Suite', () => {
  test('debe cargar la pantalla de login sin errores de consola no controlados', async ({
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

    // Validar que no hay excepciones fatales en runtime
    expect(consoleErrors).toEqual([]);
  });

  test('debe validar campos obligatorios al intentar enviar formulario vacio', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Debe mostrar mensajes de validacion reactivos
    await expect(page.locator('text=correo electrónico válido')).toBeVisible();
  });

  test('debe autenticar con mock route y redirigir al dashboard', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'jwt-e2e-valid-token-mock',
          refreshToken: 'refresh-e2e-mock',
          expiresIn: 3600,
          user: {
            id: 'usr-e2e-1',
            email: 'cajero@nalunpos.com',
            fullName: 'Cajero Operador E2E',
            role: 'Cajero',
            tenantId: 'tenant-retail-01',
            permissions: ['POS_SALES'],
          },
        }),
      });
    });

    await page.goto('/login');
    await page.fill('#email-input', 'cajero@nalunpos.com');
    await page.fill('#password-input', 'Password123!');
    await page.click('button[type="submit"]');

    // Debe redirigir fuera de /login
    await expect(page).not.toHaveURL(/\/login/);
  });
});
