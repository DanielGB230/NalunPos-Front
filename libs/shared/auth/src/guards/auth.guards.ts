// =============================================================================
// Guards Funcionales — Angular 22
// authGuard: Protege rutas que requieren autenticación.
// roleGuard: Protege rutas que requieren un rol específico.
// =============================================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import type { UserRole } from '../interfaces/auth.interfaces';

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
 * Redirige a /forbidden si el usuario no tiene el rol requerido.
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const userRole = authService.userRole();
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};
