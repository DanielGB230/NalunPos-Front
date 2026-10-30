// =============================================================================
// app-number.pipe.ts — @nalunpos/shared/util
// Pipe ligero para formateo numérico y de moneda usando Intl.NumberFormat nativo.
// =============================================================================

import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

/**
 * Pipe ligero para formateo numérico y de moneda usando Intl.NumberFormat nativo.
 */
@Pipe({
  name: 'appNumber',
  standalone: true,
  pure: true,
})
export class AppNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined, digitsInfo: string = '1.2-2'): string {
    if (value === null || value === undefined || value === '') return '';

    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) return '';

    // Extraer minimumFractionDigits y maximumFractionDigits de '1.2-2'
    let minFraction = 2;
    let maxFraction = 2;

    const parts = digitsInfo.split('.');
    if (parts.length > 1 && parts[1]) {
      const fracParts = parts[1].split('-');
      const firstFrac = fracParts[0];
      if (firstFrac) {
        minFraction = parseInt(firstFrac, 10) || 0;
      }
      const secondFrac = fracParts.length > 1 ? fracParts[1] : undefined;
      maxFraction =
        secondFrac !== undefined ? parseInt(secondFrac, 10) || minFraction : minFraction;
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
    }).format(num);
  }
}
