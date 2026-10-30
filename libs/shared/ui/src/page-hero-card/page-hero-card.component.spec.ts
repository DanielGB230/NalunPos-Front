import { describe, it, expect, vi } from 'vitest';
import { PageHeroCardComponent } from './page-hero-card.component';
import type { PageHeroConfig } from './page-hero-card.model';

describe('PageHeroCardComponent', () => {
  const mockConfig: PageHeroConfig = {
    badge: 'Módulo',
    title: 'Gestión de',
    titleHighlight: 'Almacenes',
    description: 'Control centralizado de inventario físico y bodegas.',
    imageUrl: '/assets/images/hero.webp',
    imageAlt: 'Hero image',
    primaryAction: { label: 'Nuevo Almacén' },
    secondaryAction: { label: 'Exportar' },
  };

  it('debe instanciarse correctamente y emitir clicks primarios y secundarios', () => {
    const component = new PageHeroCardComponent();
    component.config = mockConfig;

    const primarySpy = vi.fn();
    const secondarySpy = vi.fn();

    component.primaryActionClick.subscribe(primarySpy);
    component.secondaryActionClick.subscribe(secondarySpy);

    component.primaryActionClick.emit();
    component.secondaryActionClick.emit();

    expect(primarySpy).toHaveBeenCalledTimes(1);
    expect(secondarySpy).toHaveBeenCalledTimes(1);
  });
});
