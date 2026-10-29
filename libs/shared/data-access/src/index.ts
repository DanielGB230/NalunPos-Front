// =============================================================================
// Public API Surface — @nalunpos/shared/data-access
// Expone interceptores HTTP base, modelos de error y utilidades de comunicación backend.
// =============================================================================

export * from './models/app-error.model';
export * from './interfaces/paged-result.interface';
export * from './interceptors/correlation-id.interceptor';
export * from './interceptors/error.interceptor';
export * from './config/app-config.interface';
export * from './config/app-config.token';

// Modelos y contratos compartidos
export * from './models/warehouse.model';
export * from './models/branch.model';
export * from './models/supplier.model';

// Servicios API compartidos
export * from './services/warehouse-api.service';
export * from './services/branch-api.service';
export * from './services/supplier-api.service';
