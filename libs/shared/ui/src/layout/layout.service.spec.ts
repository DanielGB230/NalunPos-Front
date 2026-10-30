import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    service = new LayoutService();
  });

  it('debe iniciar con menú móvil cerrado y sidebar desplegado', () => {
    expect(service.isMobileMenuOpen()).toBe(false);
    expect(service.isSidebarCollapsed()).toBe(false);
  });

  it('debe alternar, abrir y cerrar el menú móvil reactivamente', () => {
    service.toggleMobileMenu();
    expect(service.isMobileMenuOpen()).toBe(true);

    service.closeMobileMenu();
    expect(service.isMobileMenuOpen()).toBe(false);

    service.openMobileMenu();
    expect(service.isMobileMenuOpen()).toBe(true);
  });

  it('debe alternar el estado colapsado del sidebar', () => {
    service.toggleSidebar();
    expect(service.isSidebarCollapsed()).toBe(true);

    service.toggleSidebar();
    expect(service.isSidebarCollapsed()).toBe(false);
  });
});
