import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-inventario-placeholder',
  standalone: true,
  imports: [],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-white mb-2">Módulo de Inventario</h1>
      <p class="text-slate-400">Gestión de almacenes, kardex, ajustes y traspasos.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioPlaceholderComponent {}
