// =============================================================================
// MetricsBentoGridComponent — @nalunpos/shared/ui
// Grid de 4 tarjetas de métricas en paletas cromáticas armónicas.
// Dumb Component: recibe array de MetricCardConfig via @Input.
// Template: Tailwind CSS únicamente — sin SCSS, sin styleUrls.
// ADR: Las clases Tailwind por variante se declaran en el mapa `cardStyles`
//      como strings literales completos para garantizar que el PurgeCSS
//      de producción las incluya en el bundle final.
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { MetricCardConfig, MetricColorVariant } from './metrics-bento-grid.model';

/** Mapa de clases Tailwind por variante cromática */
interface VariantStyle {
  container: string;
  label: string;
  topIndicator: string;
  valueColor: string;
  badge: string;
  track: string;
  progress: string;
}

@Component({
  selector: 'lib-metrics-bento-grid',
  standalone: true,
  imports: [NgClass],
  templateUrl: './metrics-bento-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class MetricsBentoGridComponent {
  /** Array de 4 tarjetas de métricas a renderizar */
  @Input({ required: true }) metrics!: MetricCardConfig[];

  /**
   * Mapa de clases Tailwind por variante cromática.
   * Todas las clases son literales completos para garantizar inclusión
   * en el bundle de producción (Tailwind source scanning).
   */
  protected readonly cardStyles: Record<MetricColorVariant, VariantStyle> = {
    purple: {
      container: 'hover:border-[#ACA0E7]/80 hover:shadow-glass-glow',
      label: 'text-[#605596]',
      topIndicator: 'bg-[#DEDAF4]/70 text-[#605596] border border-[#ACA0E7]/40',
      valueColor: 'text-[#161B2D]',
      badge: 'text-[#6C52EE] bg-[#DEDAF4]/80 border border-[#ACA0E7]/50',
      track: 'bg-[#DEDAF4]/50',
      progress: 'bg-linear-to-r from-[#ACA0E7] to-[#DEDAF4] shadow-[0_0_8px_rgba(172,160,231,0.6)]',
    },
    blue: {
      container: 'hover:border-[#92AAE7]/80 hover:shadow-glass-glow',
      label: 'text-[#3B71E8]',
      topIndicator: 'bg-[#DBE6FB] text-[#3B71E8] border border-[#92AAE7]/40',
      valueColor: 'text-[#161B2D]',
      badge: 'text-[#3B71E8] bg-[#EEF5FE] border border-[#92AAE7]/40',
      track: 'bg-[#DBE6FB]/60',
      progress: 'bg-linear-to-r from-[#92AAE7] to-[#DBE6FB] shadow-[0_0_8px_rgba(146,170,231,0.6)]',
    },
    orchid: {
      container: 'hover:border-[#E8A0BF] hover:shadow-orchid-glow',
      label: 'text-[#9B2C67]',
      topIndicator: 'bg-[#FCE7F0] text-[#9B2C67] border border-[#E8A0BF]/50',
      valueColor: 'text-[#9B2C67]',
      badge: 'text-[#9B2C67] bg-[#FDF2F7] border border-[#E8A0BF]/60',
      track: 'bg-[#FCE7F0]',
      progress: 'bg-linear-to-r from-[#E8A0BF] to-[#FCE7F0] shadow-[0_0_8px_rgba(232,160,191,0.6)]',
    },
    cobalt: {
      container: 'hover:border-[#687FE5] hover:shadow-cobalt-glow',
      label: 'text-[#283FA7]',
      topIndicator: 'bg-linear-to-tr from-[#687FE5] to-[#C5D2F8] text-white border-transparent',
      valueColor: 'text-[#161B2D]',
      badge: 'text-[#283FA7] bg-[#EEF3FE] border border-[#687FE5]/40',
      track: 'bg-[#EEF3FE]',
      progress: 'bg-linear-to-r from-[#687FE5] to-[#C5D2F8] shadow-[0_0_8px_rgba(104,127,229,0.6)]',
    },
  };
}
