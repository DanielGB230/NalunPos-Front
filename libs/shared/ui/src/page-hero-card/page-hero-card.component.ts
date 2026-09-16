// =============================================================================
// PageHeroCardComponent — @nalunpos/shared/ui
// Componente Hero de cabecera reutilizable para todos los módulos del panel.
// Dumb Component: recibe config vía @Input, emite clicks vía @Output.
// Template: Tailwind CSS únicamente — sin SCSS, sin styleUrls.
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { PageHeroConfig } from './page-hero-card.model';

@Component({
  selector: 'lib-page-hero-card',
  standalone: true,
  imports: [],
  templateUrl: './page-hero-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Host como block: garantiza que space-y-* del contenedor padre funcione
  // correctamente (los custom elements son inline por defecto en el navegador)
  host: { class: 'block' },
})
export class PageHeroCardComponent {
  /** Configuración completa del hero (requerida) */
  @Input({ required: true }) config!: PageHeroConfig;

  /** Emitido al hacer clic en el botón de acción primaria */
  @Output() primaryActionClick = new EventEmitter<void>();

  /** Emitido al hacer clic en el botón de acción secundaria */
  @Output() secondaryActionClick = new EventEmitter<void>();
}
