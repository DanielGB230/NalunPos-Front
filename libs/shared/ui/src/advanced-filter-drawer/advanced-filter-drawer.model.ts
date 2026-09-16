// =============================================================================
// FilterDrawerModel — @nalunpos/shared/ui
// Modelo de configuración del Drawer lateral de filtros avanzados.
// Soporta secciones de tipo: checkboxes | select | range
// =============================================================================

/** Tipo de sección de filtro */
export type FilterSectionType = 'checkboxes' | 'select' | 'range';

/** Variante cromática de una opción de checkbox */
export type FilterOptionVariant = 'default' | 'blue' | 'orchid';

/** Opción individual de un grupo de checkboxes */
export interface FilterOption {
  /** Etiqueta visible de la opción */
  label: string;
  /** Valor clave de la opción */
  value: string;
  /** Estado inicial del checkbox */
  checked?: boolean;
  /** Paleta cromática del checkbox activo */
  colorVariant?: FilterOptionVariant;
}

/** Opción de un select dropdown */
export interface SelectOption {
  /** Etiqueta visible */
  label: string;
  /** Valor de la opción */
  value: string;
  /** Si true, es la opción por defecto */
  selected?: boolean;
}

/** Configuración de un slider de rango */
export interface RangeConfig {
  min: number;
  max: number;
  step?: number;
  /** Valor inicial del slider */
  defaultValue?: number;
  /** Unidad de medida (ej: "GB", "USD", "ms") */
  unit: string;
  /** Etiquetas de los extremos del slider */
  ticks?: (string | number)[];
}

/** Sección individual del drawer de filtros */
export interface FilterSection {
  /** Etiqueta del grupo de filtros */
  label: string;
  /** Tipo de control de filtro */
  type: FilterSectionType;
  /** Nota adicional al lado del label (ej: "Multi-selección") */
  note?: string;
  /** Opciones de checkbox — solo para type: 'checkboxes' */
  options?: FilterOption[];
  /** Opciones del select — solo para type: 'select' */
  selectOptions?: SelectOption[];
  /** Configuración del rango — solo para type: 'range' */
  rangeConfig?: RangeConfig;
}

/**
 * Configuración completa del AdvancedFilterDrawerComponent.
 * El Page Component (Smart) define esta config y la pasa como @Input.
 */
export interface FilterDrawerConfig {
  /** Título del panel lateral */
  title: string;
  /** Secciones de filtros a renderizar */
  sections: FilterSection[];
}
