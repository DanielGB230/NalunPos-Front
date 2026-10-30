import { describe, expect, it } from 'vitest';
import { AppDatePipe } from './app-date.pipe';

describe('AppDatePipe', () => {
  const pipe = new AppDatePipe();

  it('debe retornar cadena vacía si el valor es nulo o indefinido', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('debe retornar cadena vacía si la fecha es inválida', () => {
    expect(pipe.transform('fecha-invalida')).toBe('');
  });

  it('debe formatear correctamente una fecha con formato por defecto dd/MM/yyyy', () => {
    // 2026-03-05 08:09:07
    const date = new Date(2026, 2, 5, 8, 9, 7);
    expect(pipe.transform(date, 'dd/MM/yyyy')).toBe('05/03/2026');
  });

  it('debe formatear con dd/MM/yyyy HH:mm', () => {
    const date = new Date(2026, 11, 25, 14, 30, 0);
    expect(pipe.transform(date, 'dd/MM/yyyy HH:mm')).toBe('25/12/2026 14:30');
  });

  it('debe formatear con HH:mm:ss', () => {
    const date = new Date(2026, 0, 1, 9, 5, 4);
    expect(pipe.transform(date, 'HH:mm:ss')).toBe('09:05:04');
  });

  it('debe formatear con HH:mm', () => {
    const date = new Date(2026, 0, 1, 15, 45, 0);
    expect(pipe.transform(date, 'HH:mm')).toBe('15:45');
  });

  it('debe usar el formato fallback si se provee un formato desconocido', () => {
    const date = new Date(2026, 4, 12, 10, 20, 30);
    expect(pipe.transform(date, 'custom-unknown')).toBe('12/05/2026 10:20');
  });

  it('debe procesar fechas pasadas como string ISO o timestamp', () => {
    const isoString = '2026-06-15T10:00:00.000Z';
    const result = pipe.transform(isoString, 'dd/MM/yyyy');
    expect(result).toMatch(/\d{2}\/\d{2}\/2026/);

    const timestamp = new Date(2026, 5, 15).getTime();
    expect(pipe.transform(timestamp, 'dd/MM/yyyy')).toBe('15/06/2026');
  });
});
