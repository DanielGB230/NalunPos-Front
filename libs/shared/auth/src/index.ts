// =============================================================================
// @nalunpos/shared/auth — Public API
// Exportaciones públicas de la librería de autenticación compartida.
// =============================================================================

// Roles canónicos y validadores de identidad
export {
  USER_ROLES,
  PLATFORM_ROLES,
  TENANT_ROLES,
  isUserRole,
  isRoleTenantCoherent,
} from './models/user-role.model';
export type { UserRole, PlatformRole, TenantRole } from './models/user-role.model';

// Contratos de autenticación
export type { LoginRequest, AuthResponse } from './interfaces/auth.interfaces';

// Modelos de dominio de sesión
export { UserSession } from './models/user-session.model';
export type { StoredAuthSession } from './models/user-session.model';

// Servicio de autenticación
export { AuthService } from './services/auth.service';

// Interceptores HTTP funcionales
export { authTokenInterceptor } from './interceptors/auth-token.interceptor';
export { sessionExpiredInterceptor } from './interceptors/session-expired.interceptor';

// Guards de rutas
export { authGuard, roleGuard } from './guards/auth.guards';
