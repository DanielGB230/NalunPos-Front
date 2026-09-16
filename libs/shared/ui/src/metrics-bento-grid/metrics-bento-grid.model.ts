// =============================================================================
// MetricCardConfig — @nalunpos/shared/ui
// Modelo de configuración del Bento Grid de métricas.
// Diseño cromático en 4 paletas: purple | blue | orchid | cobalt
// =============================================================================

/** Variante cromática de la tarjeta de métrica */
export type MetricColorVariant = 'purple' | 'blue' | 'orchid' | 'cobalt';

/**
 * Configuración de una tarjeta individual del Bento Grid.
 * El array de 4 MetricCardConfig se pasa como @Input al MetricsBentoGridComponent.
 */
export interface MetricCardConfig {
  /** Etiqueta superior izquierda (ej: "Total Categorías") */
  label: string;
  /** Valor principal grande (ej: 42 | "$38,450" | "100%") */
  value: string | number;
  /** Sufijo opcional junto al valor (ej: "/ 14" para "14 / 14") */
  valueSuffix?: string;
  /** Texto del badge a la derecha del valor */
  badge: string;
  /** Si true, muestra flecha ascendente antes del badge (tarjeta purple) */
  badgeHasArrow?: boolean;
  /** Si true, muestra punto ping antes del badge (tarjeta orchid) */
  badgeHasPing?: boolean;
  /** Contenido del indicador en la esquina superior derecha (número, "$", "%", etc.) */
  topIndicator: string | number;
  /** Si true, muestra icono SVG de checkmark en lugar del topIndicator (tarjeta blue) */
  topIndicatorIsCheck?: boolean;
  /** Porcentaje de la barra de progreso (0-100) */
  progressPercent: number;
  /** Paleta cromática de la tarjeta */
  colorVariant: MetricColorVariant;
}
