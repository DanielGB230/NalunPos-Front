import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suppliers-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-white mb-2">Módulo de Proveedores</h1>
      <p class="text-slate-400">Gestión de catálogo maestro de proveedores.</p>
    </div>
  `,
})
export class SuppliersPlaceholderComponent {}
