// =============================================================================
// AdvancedFilterDrawerComponent — @nalunpos/shared/ui
// Drawer lateral flotante de filtros avanzados con secciones dinámicas.
// Dumb Component: recibe config via @Input, emite acciones via @Output.
// Template: Tailwind CSS únicamente — sin SCSS, sin styleUrls.
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FilterDrawerConfig, FilterOptionVariant } from './advanced-filter-drawer.model';

@Component({
  selector: 'lib-advanced-filter-drawer',
  standalone: true,
  imports: [],
  templateUrl: './advanced-filter-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // El drawer es absoluto en el layout, pero necesita block para no romper
  // el flujo del contenedor. Su posición la controla el parent con `relative`.
  host: { class: 'block' },
})
export class AdvancedFilterDrawerComponent {
  /** Controla si el drawer está visible */
  @Input({ required: true }) isOpen!: boolean;

  /** Configuración de secciones de filtros */
  @Input({ required: true }) config!: FilterDrawerConfig;

  /** Conteo de resultados para mostrar en el subtitle del header */
  @Input() resultCount = 0;

  /** Etiqueta de la unidad de resultados (ej: "Tenants", "Categorías") */
  @Input() resultLabel = 'resultados';

  /** Emitido al cerrar el drawer (clic en backdrop o botón X) */
  @Output() close = new EventEmitter<void>();

  /** Emitido al hacer clic en "Aplicar Filtros" */
  @Output() apply = new EventEmitter<void>();

  /** Emitido al hacer clic en "Limpiar todo" */
  @Output() clear = new EventEmitter<void>();

  /**
   * Retorna las clases CSS de un checkbox según su variante cromática.
   * Literales completos para garantizar inclusión en bundle de producción.
   */
  protected getCheckboxClass(variant: FilterOptionVariant = 'default'): string {
    const map: Record<FilterOptionVariant, string> = {
      default: 'accent-[#605596] border-[#ACA0E7] text-[#605596] focus:ring-[#ACA0E7]',
      blue:    'accent-[#283FA7] border-[#92AAE7] text-[#283FA7] focus:ring-[#92AAE7]',
      orchid:  'accent-[#9B2C67] border-[#E8A0BF] text-[#9B2C67] focus:ring-[#E8A0BF]',
    };
    return `rounded ${map[variant]}`;
  }

  /**
   * Retorna las clases del contenedor de un checkbox según su variante.
   * Literales completos para garantizar inclusión en bundle de producción.
   */
  protected getOptionContainerClass(variant: FilterOptionVariant = 'default'): string {
    const map: Record<FilterOptionVariant, string> = {
      default: 'bg-white/70 border-[#DEDAF4] hover:bg-white',
      blue:    'bg-white/70 border-[#DEDAF4] hover:bg-white',
      orchid:  'bg-[#FDF2F7] border-[#E8A0BF]/50 hover:bg-[#FCE7F0]',
    };
    return `flex items-center space-x-2 p-2 rounded-xl border cursor-pointer transition ${map[variant]}`;
  }

  /**
   * Retorna las clases del label de texto de un checkbox según su variante.
   */
  protected getOptionLabelClass(variant: FilterOptionVariant = 'default'): string {
    const map: Record<FilterOptionVariant, string> = {
      default: 'font-medium text-[#161B2D]',
      blue:    'font-medium text-[#161B2D]',
      orchid:  'font-semibold text-[#9B2C67]',
    };
    return `text-xs ${map[variant]}`;
  }
}
