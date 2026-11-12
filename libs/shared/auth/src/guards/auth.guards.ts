// =============================================================================
// Guards Funcionales — Angular 22
// authGuard: Protege rutas que requieren autenticación.
// roleGuard: Protege rutas que requieren un rol específico.
// =============================================================================

import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { isRoleTenantCoherent, isUserRole, type UserRole } from '../models/user-role.model';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticación.
 * Redirige a /login si el usuario no está autenticado o su sesión expiró.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

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
