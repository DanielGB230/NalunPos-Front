// =============================================================================
// Guards Funcionales — Angular 22
// authGuard: Protege rutas que requieren autenticación.
// roleGuard: Protege rutas que requieren un rol específico.
// =============================================================================

import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router, type UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { isRoleTenantCoherent, isUserRole, type UserRole } from '../models/user-role.model';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticación asíncrono.
 * Garantiza una sesión vigente (refrescándola si el token expiró) antes de activar
 * la ruta. Si no hay sesión válida redirige a /login conservando el returnUrl.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .ensureValidSession()
    .pipe(map((isValid) => (isValid ? true : buildLoginRedirect(router, state.url))));
};

function buildLoginRedirect(router: Router, returnUrl: string | undefined): UrlTree {
  if (returnUrl !== undefined && returnUrl.length > 0 && returnUrl !== '/') {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }
  return router.createUrlTree(['/login']);
}

/**
 * Factory de guard de rol.
 * Uso: canActivate: [roleGuard(['SuperAdmin', 'TenantAdmin'])]
 *
 * Redirige a /forbidden si el rol está ausente, no es canónico, es incoherente
 * con el tenantId de sesión o no está permitido.
 */
export const roleGuard = (allowedRoles: readonly UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const userRole = authService.userRole();
    const tenantId = authService.tenantId();
    if (
      userRole &&
      isUserRole(userRole) &&
      isRoleTenantCoherent(userRole, tenantId) &&
      allowedRoles.includes(userRole)
    ) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};
