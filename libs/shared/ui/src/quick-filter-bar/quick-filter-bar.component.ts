// =============================================================================
// QuickFilterBarComponent — @nalunpos/shared/ui
// Barra de filtros rápidos: tabs + buscador + botón de filtros avanzados.
// Dumb Component: recibe config via @Input, emite cambios via @Output.
// Template: Tailwind CSS únicamente — sin SCSS, sin styleUrls.
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { QuickFilterColorVariant, QuickFilterTab } from './quick-filter-bar.model';

@Component({
  selector: 'lib-quick-filter-bar',
  standalone: true,
  imports: [],
  templateUrl: './quick-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class QuickFilterBarComponent {
  /** Tabs de filtro rápido (ej: Todos, Activos, Inactivos) */
  @Input({ required: true }) tabs!: QuickFilterTab[];

  /** Clave del tab actualmente seleccionado */
  @Input() activeFilter = 'all';

  /** Valor actual del input de búsqueda */
  @Input() searchValue = '';

  /** Placeholder del input de búsqueda */
  @Input() searchPlaceholder = 'Buscar...';

  /** Si el drawer de filtros avanzados está abierto */
  @Input() showAdvancedFilters = false;

  /** Número de filtros avanzados activos (mostrado en el badge) */
  @Input() activeFilterCount = 0;

  /** Emite la clave del nuevo tab seleccionado */
  @Output() filterChange = new EventEmitter<string>();

  /** Emite el nuevo valor del buscador */
  @Output() searchChange = new EventEmitter<string>();

  /** Emite cuando se hace clic en el botón de filtros avanzados */
  @Output() advancedToggle = new EventEmitter<void>();

  protected onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  /**
   * Retorna la clase CSS completa de un tab según su variante y estado activo.
   * Usa literales de clase completos para garantizar inclusión en el bundle
   * de producción por el scanner de Tailwind.
   */
  protected getTabClass(tab: QuickFilterTab, isActive: boolean): string {
    const base = 'px-4 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer flex items-center transition';
    const variant: QuickFilterColorVariant = tab.colorVariant ?? 'default';

    if (isActive) {
      const activeMap: Record<QuickFilterColorVariant, string> = {
        default: 'bg-[#161B2D] text-white font-bold shadow-xs',
        blue:    'bg-[#283FA7] text-white font-bold shadow-xs',
        orchid:  'bg-[#9B2C67] text-white font-bold shadow-xs',
      };
      return `${base} ${activeMap[variant]}`;
    }

    const inactiveMap: Record<QuickFilterColorVariant, string> = {
      default: 'bg-white/70 hover:bg-white text-[#605596] hover:text-[#161B2D] font-semibold border border-[#DEDAF4]',
      blue:    'bg-white/70 hover:bg-white text-[#283FA7] hover:text-[#161B2D] font-semibold border border-[#92AAE7]/40',
      orchid:  'bg-[#FDF2F7] hover:bg-[#FCE7F0] text-[#9B2C67] font-semibold border border-[#E8A0BF]/60 shadow-xs',
    };
    return `${base} ${inactiveMap[variant]}`;
  }
}
