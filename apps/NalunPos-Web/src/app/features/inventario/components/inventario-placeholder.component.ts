import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-white mb-2">Módulo de Inventario</h1>
      <p class="text-slate-400">Gestión de almacenes, kardex, ajustes y traspasos.</p>
    </div>
  `,
})
export class InventarioPlaceholderComponent {}
