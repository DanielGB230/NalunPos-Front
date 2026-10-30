import { describe, expect, it } from 'vitest';
import { AppNumberPipe } from './app-number.pipe';

describe('AppNumberPipe', () => {
  const pipe = new AppNumberPipe();

  it('debe retornar cadena vacía para valores nulos, vacíos o indefinidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('debe retornar cadena vacía si no es un número válido', () => {
    expect(pipe.transform('no-es-numero')).toBe('');
  });

  it('debe formatear números con el formato predeterminado 1.2-2', () => {
    expect(pipe.transform(1234.5)).toBe('1,234.50');
    expect(pipe.transform('1234.567')).toBe('1,234.57');
  });

  it('debe soportar dígitos personalizados sin decimales', () => {
    expect(pipe.transform(1500, '1.0-0')).toBe('1,500');
  });

  it('debe soportar rangos de decimales como 1.2-4', () => {
    expect(pipe.transform(12.34567, '1.2-4')).toBe('12.3457');
  });

  it('debe manejar variaciones en digitsInfo con fallback seguro', () => {
    expect(pipe.transform(50, '1')).toBe('50.00');
    expect(pipe.transform(50, '1.invalid')).toBe('50');
    expect(pipe.transform(50.1234, '1.-3')).toBe('50.123');
  });
});
