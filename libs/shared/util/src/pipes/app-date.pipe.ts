// =============================================================================
// app-date.pipe.ts — @nalunpos/shared/util
// Pipe ligero y de alto rendimiento basado en la API nativa de Intl del navegador.
// Evita la inclusión de los pesados diccionarios i18n de Angular (~115 KB).
// =============================================================================

import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

/**
 * Pipe ligero para formateo de fechas usando Intl.DateTimeFormat nativo del navegador.
 * Soporta formatos comunes: 'dd/MM/yyyy HH:mm', 'dd/MM/yyyy', 'HH:mm:ss', 'HH:mm'.
 */
@Pipe({
  name: 'appDate',
  standalone: true,
  pure: true,
})
export class AppDatePipe implements PipeTransform {
  transform(
    value: string | number | Date | null | undefined,
    format: 'dd/MM/yyyy HH:mm' | 'dd/MM/yyyy' | 'HH:mm:ss' | 'HH:mm' | string = 'dd/MM/yyyy',
  ): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';

    const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    switch (format) {
      case 'dd/MM/yyyy HH:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'HH:mm:ss':
        return `${hours}:${minutes}:${seconds}`;
      case 'HH:mm':
        return `${hours}:${minutes}`;
      default:
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  }
}
