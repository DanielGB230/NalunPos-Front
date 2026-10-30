import { describe, it, expect } from 'vitest';
import { MetricsBentoGridComponent } from './metrics-bento-grid.component';
import type { MetricCardConfig } from './metrics-bento-grid.model';

describe('MetricsBentoGridComponent', () => {
  const mockMetrics: MetricCardConfig[] = [
    {
      title: 'Total Almacenes',
      value: '12',
      trend: '+2 este mes',
      variant: 'purple',
    },
    {
      title: 'Capacidad Usada',
      value: '78%',
      trend: '+5%',
      variant: 'blue',
    },
  ];

  it('debe inicializarse con métricas y tener estilos de variantes definidos', () => {
    const component = new MetricsBentoGridComponent();
    component.metrics = mockMetrics;
    component.isLoading = false;

    expect(component.isLoading).toBe(false);
    expect(component.metrics).toEqual(mockMetrics);
    expect((component as any).cardStyles.purple).toBeDefined();
    expect((component as any).cardStyles.blue).toBeDefined();
    expect((component as any).cardStyles.orchid).toBeDefined();
    expect((component as any).cardStyles.cobalt).toBeDefined();
  });
});
