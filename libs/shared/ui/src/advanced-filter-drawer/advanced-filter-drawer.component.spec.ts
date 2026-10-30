import { describe, it, expect, vi } from 'vitest';
import { AdvancedFilterDrawerComponent } from './advanced-filter-drawer.component';
import type { FilterDrawerConfig } from './advanced-filter-drawer.model';

describe('AdvancedFilterDrawerComponent', () => {
  const mockConfig: FilterDrawerConfig = {
    title: 'Filtros Avanzados',
    sections: [
      {
        id: 'status',
        title: 'Estado',
        options: [
          { id: 'opt1', label: 'Activo', value: 'active', selected: true, variant: 'blue' },
          { id: 'opt2', label: 'Inactivo', value: 'inactive', selected: false, variant: 'orchid' },
        ],
      },
    ],
  };

  it('debe emitir close, apply y clear', () => {
    const component = new AdvancedFilterDrawerComponent();
    component.config = mockConfig;
    component.isOpen = true;

    const closeSpy = vi.fn();
    const applySpy = vi.fn();
    const clearSpy = vi.fn();

    component.close.subscribe(closeSpy);
    component.apply.subscribe(applySpy);
    component.clear.subscribe(clearSpy);

    component.close.emit();
    component.apply.emit();
    component.clear.emit();

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(applySpy).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('debe calcular clases de variantes para opciones y checkbox', () => {
    const component = new AdvancedFilterDrawerComponent();
    component.config = mockConfig;

    const cbClass = (component as any).getCheckboxClass('blue');
    const containerClass = (component as any).getOptionContainerClass('orchid');
    const labelClass = (component as any).getOptionLabelClass('default');

    expect(cbClass).toContain('accent-[#283FA7]');
    expect(containerClass).toContain('bg-[#FDF2F7]');
    expect(labelClass).toContain('font-medium');
  });
});
