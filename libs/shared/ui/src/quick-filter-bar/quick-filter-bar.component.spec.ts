import { describe, it, expect, vi } from 'vitest';
import { QuickFilterBarComponent } from './quick-filter-bar.component';
import type { QuickFilterTab } from './quick-filter-bar.model';

describe('QuickFilterBarComponent', () => {
  const mockTabs: QuickFilterTab[] = [
    { key: 'all', label: 'Todos', colorVariant: 'default' },
    { key: 'active', label: 'Activos', colorVariant: 'blue' },
    { key: 'inactive', label: 'Inactivos', colorVariant: 'orchid' },
  ];

  it('debe emitir cambios de filtro y de búsqueda', () => {
    const component = new QuickFilterBarComponent();
    component.tabs = mockTabs;

    const filterSpy = vi.fn();
    const searchSpy = vi.fn();
    const advancedSpy = vi.fn();

    component.filterChange.subscribe(filterSpy);
    component.searchChange.subscribe(searchSpy);
    component.advancedToggle.subscribe(advancedSpy);

    component.filterChange.emit('active');
    component.advancedToggle.emit();

    const mockEvent = { target: { value: 'test query' } } as unknown as Event;
    (component as any).onSearchInput(mockEvent);

    expect(filterSpy).toHaveBeenCalledWith('active');
    expect(advancedSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith('test query');
  });

  it('debe retornar clases adecuadas para tabs activos e inactivos', () => {
    const component = new QuickFilterBarComponent();
    component.tabs = mockTabs;

    const activeClass = (component as any).getTabClass(mockTabs[0]!, true);
    const inactiveClass = (component as any).getTabClass(mockTabs[1]!, false);

    expect(activeClass).toContain('bg-[#161B2D]');
    expect(inactiveClass).toContain('bg-white/70');
  });
});
