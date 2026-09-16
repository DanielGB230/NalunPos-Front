// =============================================================================
// PageHeroConfig — @nalunpos/shared/ui
// Modelo de configuración del Hero principal de cada módulo del panel NalunPOS.
// Reutilizable en Tenants, Categorías, Productos, Inventario, Ventas, etc.
// =============================================================================

/** Acción de botón en el hero (primaria o secundaria) */
export interface HeroAction {
  /** Texto a mostrar en el botón */
  label: string;
}

/**
 * Configuración completa del PageHeroCardComponent.
 * El Page Component (Smart) define esta config y la pasa como @Input.
 */
export interface PageHeroConfig {
  /** Badge superior (ej: "CATÁLOGO DE PRODUCTOS • POS OPERATIVO") */
  badge: string;
  /** Texto principal del h1 antes del texto resaltado */
  title: string;
  /** Texto en gradiente lila→celeste del h1 (ej: "Categorías") */
  titleHighlight: string;
  /** Descripción debajo del título */
  description: string;
  /** URL de la imagen decorativa en la esquina derecha */
  imageUrl: string;
  /** Alt text accesible de la imagen decorativa */
  imageAlt?: string;
  /** Botón de acción principal — gradiente lila-cobalto */
  primaryAction?: HeroAction;
  /** Botón de acción secundaria — glass surface */
  secondaryAction?: HeroAction;
}
