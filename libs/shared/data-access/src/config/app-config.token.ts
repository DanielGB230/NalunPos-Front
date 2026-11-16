// =============================================================================
// APP_CONFIG Token — @nalunpos/shared/data-access
// Único contrato de inyección para la configuración de runtime ya resuelta.
// El valor se provee como `useValue` en el bootstrap de cada aplicación, por lo
// que el estado "configuración no cargada" es irrepresentable en el inyector.
// =============================================================================

import { InjectionToken } from '@angular/core';
import type { AppConfig } from './app-config.interface';

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
