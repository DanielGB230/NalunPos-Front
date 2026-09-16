// =============================================================================
// QuickFilterBarModel — @nalunpos/shared/ui
// Modelo de configuración del componente de filtros rápidos tipo tab + buscador.
// Reutilizable en Tenants, Categorías, Productos, Ventas, etc.
// =============================================================================

/** Variante cromática del tab de filtro rápido */
export type QuickFilterColorVariant = 'default' | 'blue' | 'orchid';

/**
 * Configuración de un tab de filtro rápido.
 * El array de QuickFilterTab se pasa como @Input al QuickFilterBarComponent.
 */
export interface QuickFilterTab {
  /** Clave única del filtro (ej: 'all', 'Active', 'Inactive') */
  key: string;
  /** Etiqueta visible del tab (puede incluir conteo: "Activos (12)") */
  label: string;
  /** Paleta cromática para estado activo/inactivo del tab */
  colorVariant?: QuickFilterColorVariant;
  /** Si true, muestra indicador ping animado (ej: para estado "Provisioning") */
  hasPing?: boolean;
}
