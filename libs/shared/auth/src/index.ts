// =============================================================================
// @nalunpos/shared/auth — Public API
// Exportaciones públicas de la librería de autenticación compartida.
// =============================================================================

// Contratos de autenticación
export type {
  LoginRequest,
  AuthResponse,
  AuthUserDto,
  UserRole,
} from './interfaces/auth.interfaces';

// Modelos de dominio de sesión
export { UserSession } from './models/user-session.model';

// Servicio de autenticación
export { AuthService } from './services/auth.service';

// Interceptor de token Bearer
export { authInterceptor } from './interceptors/auth.interceptor';

// Guards de rutas
export { authGuard, roleGuard } from './guards/auth.guards';
