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

    // Sin cookie de refresh: el arranque no restaura sesión y no bloquea la app.
    await page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'Auth.RefreshTokenInvalid',
          title: 'Unauthorized',
          status: 401,
        }),
      });
    });

    // Logout idempotente contra el servidor.
    await page.route('**/api/v1/auth/logout', async (route) => {
      await route.fulfill({ status: 204, body: '' });
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

    // El refresh de arranque sin cookie devuelve 401: el navegador lo registra como
    // error de recurso esperado. Se descarta ese mensaje y se exige cero errores reales.
    const unexpectedErrors = consoleErrors.filter(
      (msg) => !msg.includes('Failed to load resource: the server responded with a status of 401'),
    );
    expect(unexpectedErrors).toEqual([]);
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

    // La sesión vive solo en memoria: no se persiste sesión ni token en storage.
    const persistedSessionKey = await page.evaluate(() =>
      window.sessionStorage.getItem('nalunpos_auth_session'),
    );
    expect(persistedSessionKey).toBeNull();

    const tokenInStorage = await page.evaluate(() => {
      const hasTokenKey = (storage: Storage): boolean =>
        Object.keys(storage).some((key) => key.toLowerCase().includes('token'));
      return hasTokenKey(window.sessionStorage) || hasTokenKey(window.localStorage);
    });
    expect(tokenInStorage).toBe(false);
  });

  test('debe restaurar la sesión en memoria tras recargar (F5) usando POST /auth/refresh', async ({
    page,
  }) => {
    const refreshResponse = {
      token: 'jwt-e2e-refresh-token-mock',
      userId: 'usr-e2e-1',
      roleId: 'role-e2e-cajero-01',
      role: 'Cajero',
      email: 'cajero@nalunpos.com',
      fullName: 'Cajero Operador E2E',
      tenantId: 'tenant-retail-01',
      expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    let hasLoggedIn = false;

    await page.route('**/api/v1/auth/refresh', async (route) => {
      if (hasLoggedIn) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(refreshResponse),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'Auth.RefreshTokenInvalid', status: 401 }),
      });
    });

    await page.route('**/api/v1/auth/login', async (route) => {
      hasLoggedIn = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(refreshResponse),
      });
    });

    await page.goto('/login');
    await page.fill('#email-input', 'cajero@nalunpos.com');
    await page.fill('#password-input', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // F5 destruye el access token en memoria y debe restaurarse vía refresh.
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=cajero@nalunpos.com').first()).toBeVisible();

    const persistedSessionKey = await page.evaluate(() =>
      window.sessionStorage.getItem('nalunpos_auth_session'),
    );
    expect(persistedSessionKey).toBeNull();
  });

  test('debe invocar POST /api/v1/auth/logout al cerrar sesión y volver a /login', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'jwt-e2e-logout-token-mock',
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
    await expect(page).toHaveURL(/\/dashboard/);

    const logoutRequest = page.waitForRequest('**/api/v1/auth/logout');
    await page.getByText('Cerrar Sesión').first().click();
    await logoutRequest;

    await expect(page).toHaveURL(/\/login/);
  });

  test('debe fallar cerrado en /login ante un rol no canónico sin crear sesión ni token en storage', async ({
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

    const tokenInStorage = await page.evaluate(() => {
      const hasTokenKey = (storage: Storage): boolean =>
        Object.keys(storage).some((key) => key.toLowerCase().includes('token'));
      return hasTokenKey(window.sessionStorage) || hasTokenKey(window.localStorage);
    });
    expect(tokenInStorage).toBe(false);
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

  test('debe renovar la sesión y reintentar una petición protegida tras un 401 sin salir de pantalla', async ({
    page,
  }) => {
    const refreshedSession = {
      token: 'jwt-e2e-refreshed-token',
      userId: 'usr-e2e-1',
      roleId: 'role-e2e-cajero-01',
      role: 'Cajero',
      email: 'cajero@nalunpos.com',
      fullName: 'Cajero Operador E2E',
      tenantId: 'tenant-retail-01',
      expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
    const pagedCategories = {
      items: [
        {
          id: 'cat-e2e-1',
          name: 'Categoría Renovada E2E',
          description: 'Categoría obtenida tras el reintento',
          isActive: true,
          createdAtUtc: new Date().toISOString(),
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    // El bootstrap restaura la sesión desde la cookie de refresh.
    await page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(refreshedSession),
      });
    });

    // La primera petición protegida recibe 401; el reintento devuelve 200.
    let categoriesCalls = 0;
    await page.route('**/api/v1/categories*', async (route) => {
      categoriesCalls += 1;
      if (categoriesCalls === 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ title: 'Unauthorized', status: 401 }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pagedCategories),
      });
    });

    await page.goto('/categorias');

    await expect(page).toHaveURL(/\/categorias/);
    await expect(page.locator('text=Categoría Renovada E2E')).toBeVisible();
    expect(categoriesCalls).toBeGreaterThanOrEqual(2);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('debe redirigir a /login cuando el refresh falla al renovar una petición protegida', async ({
    page,
  }) => {
    const initialSession = {
      token: 'jwt-e2e-session-token',
      userId: 'usr-e2e-1',
      roleId: 'role-e2e-cajero-01',
      role: 'Cajero',
      email: 'cajero@nalunpos.com',
      fullName: 'Cajero Operador E2E',
      tenantId: 'tenant-retail-01',
      expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    let refreshCalls = 0;
    await page.route('**/api/v1/auth/refresh', async (route) => {
      refreshCalls += 1;
      if (refreshCalls === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(initialSession),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ title: 'Unauthorized', status: 401 }),
      });
    });

    await page.route('**/api/v1/categories*', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ title: 'Unauthorized', status: 401 }),
      });
    });

    await page.goto('/categorias');

    await expect(page).toHaveURL(/\/login/);
    expect(refreshCalls).toBeGreaterThanOrEqual(2);
  });
});
