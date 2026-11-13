import { test, expect } from '@playwright/test';

test.describe('NalunPos-Web Smoke Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptación de /config.json para servir configuración runtime de producción sin requerir config.json en dist
    await page.route('**/config.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apiUrl: 'https://api.nalunpos.com',
          appName: 'NalunPos — Panel Operativo',
          production: true,
        }),
      });
    });
  });

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

  test('no debe registrar violaciones de Content Security Policy (securitypolicyviolation) al cargar /login', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
        const globalAny = window as unknown as { __cspViolations?: unknown[] };
        globalAny.__cspViolations = globalAny.__cspViolations || [];
        globalAny.__cspViolations.push({
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy,
        });
      });
    });

    await page.goto('/login');
    await expect(page).toHaveTitle(/NalunPos/i);
    await expect(page.locator('#email-input')).toBeVisible();

    const recordedViolations = await page.evaluate(() => {
      const globalAny = window as unknown as { __cspViolations?: unknown[] };
      return globalAny.__cspViolations || [];
    });

    expect(recordedViolations).toEqual([]);
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
          userId: 'usr-e2e-1',
          roleId: 'role-e2e-cajero-01',
          role: 'Cajero',
          email: 'cajero@nalunpos.com',
          fullName: 'Cajero Operador E2E',
          tenantId: 'tenant-retail-01',
          expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
        }),
      });
    });

    await page.goto('/login');
    await page.fill('#email-input', 'cajero@nalunpos.com');
    await page.fill('#password-input', 'Password123!');
    await page.click('button[type="submit"]');

    // Debe redirigir fuera de /login hacia /dashboard
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('debe fallar cerrado en /login ante un rol no canónico sin crear sesión en sessionStorage', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'jwt-e2e-custom-role-token',
          userId: '01950000-0000-7000-8000-000000000099',
          roleId: '01950000-0000-7000-8000-000000000088',
          role: 'RolPersonalizado',
          email: 'custom@nalunpos.com',
          fullName: 'Usuario Rol Personalizado',
          tenantId: '01950000-0000-7000-8000-000000000010',
          expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
        }),
      });
    });

    await page.goto('/login');
    await page.fill('#email-input', 'custom@nalunpos.com');
    await page.fill('#password-input', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.locator(
        'text=No fue posible iniciar sesión. Verifica tus credenciales e intenta de nuevo.',
      ),
    ).toBeVisible();

    const storedSession = await page.evaluate(() =>
      window.sessionStorage.getItem('nalunpos_auth_session'),
    );
    expect(storedSession).toBeNull();
  });

  test('debe redirigir a /forbidden cuando SuperAdmin intenta acceder al layout protegido de NalunPos-Web', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'jwt-e2e-superadmin-token',
          userId: '01950000-0000-7000-8000-000000000001',
          roleId: '00000000-0000-0000-0000-000000000001',
          role: 'SuperAdmin',
          email: 'superadmin@nalunpos.com',
          fullName: 'Super Administrador Plataforma',
          tenantId: null,
          expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
        }),
      });
    });

    await page.goto('/login');
    await page.fill('#email-input', 'superadmin@nalunpos.com');
    await page.fill('#password-input', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/forbidden/);
  });
});
