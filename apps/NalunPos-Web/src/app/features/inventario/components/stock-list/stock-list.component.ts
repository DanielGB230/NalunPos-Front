// =============================================================================
// StockListComponent — NalunPos-Web / features/inventario
// Smart Component: muestra el stock actual por almacén con paginación y búsqueda.
// Usa rxResource para carga reactiva. Reacciona a cambios de warehouseId y refreshTick.
// Angular 22 — Zoneless — Standalone — Tailwind v4 only
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { QuickFilterBarComponent, QuickFilterTab } from '@nalunpos/shared/ui';
import { StockLevel } from '../../interfaces/stock-level.interface';
import { StockLevelApiService } from '../../services/stock-level-api.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    QuickFilterBarComponent,
  ],
  templateUrl: './stock-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockListComponent implements OnChanges {
  private readonly stockLevelApi = inject(StockLevelApiService);

  @Input() warehouseId: string | null = null;
  @Input() refreshTick = 0;

  // ── Estado reactivo ──
  protected readonly stockLevels = signal<StockLevel[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly stockFilter = signal<'all' | 'ok' | 'low' | 'reserved'>('all');

  // ── Columnas de la tabla ──
  protected readonly displayedColumns: string[] = [
    'producto',
    'disponible',
    'reservado',
    'minimo',
    'estado',
  ];

  // ── Filtros rápidos ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => {
    const items = this.stockLevels();
    const lowCount = items.filter((s) => s.isBelowMinThreshold).length;
    return [
      { key: 'all', label: `Todos (${this.totalCount()})`, colorVariant: 'default' },
      { key: 'ok', label: `OK (${items.filter((s) => !s.isBelowMinThreshold).length})`, colorVariant: 'blue' },
      { key: 'low', label: `Stock Bajo (${lowCount})`, colorVariant: 'orchid', hasPing: lowCount > 0 },
    ];
  });

  // ── Stock filtrado localmente ──
  protected readonly filteredStock = computed(() => {
    const filter = this.stockFilter();
    const items = this.stockLevels();
    if (filter === 'all') return items;
    if (filter === 'ok') return items.filter((s) => !s.isBelowMinThreshold);
    if (filter === 'low') return items.filter((s) => s.isBelowMinThreshold);
    return items;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['warehouseId'] || changes['refreshTick']) {
      this.pageIndex.set(0);
      this.loadStock();
    }
  }

  protected loadStock(): void {
    if (!this.warehouseId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.stockLevelApi
      .getStockByWarehouse(this.warehouseId, this.pageIndex() + 1, this.pageSize())
      .subscribe({
        next: (result) => {
          this.stockLevels.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('No se pudo cargar el stock del almacén seleccionado.');
        },
      });
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadStock();
  }

  protected onFilterChange(key: string): void {
    this.stockFilter.set(key as 'all' | 'ok' | 'low' | 'reserved');
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStock();
  }

  protected getAvailabilityPercent(level: StockLevel): number {
    const total = level.quantityAvailable + level.quantityReserved;
    if (total === 0) return 0;
    return Math.round((level.quantityAvailable / total) * 100);
  }
}
