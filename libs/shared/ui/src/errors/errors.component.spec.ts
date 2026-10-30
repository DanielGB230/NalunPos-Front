import { describe, it, expect } from 'vitest';
import { ForbiddenComponent } from './forbidden.component';
import { NotFoundComponent } from './not-found.component';

describe('Errors Components', () => {
  it('debe instanciar ForbiddenComponent correctamente', () => {
    const comp = new ForbiddenComponent();
    expect(comp).toBeDefined();
  });

  it('debe instanciar NotFoundComponent correctamente', () => {
    const comp = new NotFoundComponent();
    expect(comp).toBeDefined();
  });
});
