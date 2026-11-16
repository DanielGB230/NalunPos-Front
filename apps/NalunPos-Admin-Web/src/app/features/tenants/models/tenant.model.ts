import type { TenantDto, TenantStatus } from '@nalunpos/shared/data-access';

export type { TenantDto, TenantStatus };

// Mapa tipado de etiquetas legibles en español (separadas del valor técnico)
export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  Active: 'Activo',
  PendingProvisioning: 'Aprovisionando',
  Suspended: 'Suspendido',
};

// Configuración tipada de insignias de estado para la UI (elimina comparaciones con strings sueltos)
export interface TenantStatusBadgeConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  avatarClass: string;
}

export const TENANT_STATUS_BADGE_CONFIG: Record<TenantStatus, TenantStatusBadgeConfig> = {
  Active: {
    label: 'Activo / En Línea',
    badgeClass: 'bg-[#EEF5FE] text-[#2A5BC7] border-[#92AAE7]',
    dotClass: 'bg-[#2A5BC7]',
    avatarClass:
      'bg-linear-to-tr from-[#687FE5] to-[#C5D2F8] text-white border border-white shrink-0',
  },
  PendingProvisioning: {
    label: 'Aprovisionando',
    badgeClass: 'bg-[#FDF2F7] text-[#9B2C67] border-[#E8A0BF]',
    dotClass: 'bg-[#9B2C67]',
    avatarClass:
      'bg-linear-to-tr from-[#E8A0BF] to-[#FCE7F0] text-[#9B2C67] border border-white/80 shrink-0',
  },
  Suspended: {
    label: 'Suspendido',
    badgeClass: 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]',
    dotClass: 'bg-[#6B7280]',
    avatarClass:
      'bg-linear-to-tr from-[#9CA3AF] to-[#E5E7EB] text-[#374151] border border-white/80 shrink-0',
  },
};

// Request de creación — tipo de entrada para el formulario
export interface CreateTenantRequest {
  name: string;
  documentNumber: string;
  adminEmail: string;
  adminPassword: string;
}
