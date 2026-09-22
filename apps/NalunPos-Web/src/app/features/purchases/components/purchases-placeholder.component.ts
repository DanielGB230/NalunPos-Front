import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchases-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-white mb-2">Módulo de Compras</h1>
      <p class="text-slate-400">Gestión de órdenes de compra y recepciones de inventario.</p>
    </div>
  `,
})
export class PurchasesPlaceholderComponent {}
