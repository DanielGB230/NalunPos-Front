// =============================================================================
// KardexComponent — NalunPos-Web / features/inventario
// Smart Component: historial de movimientos de inventario (Kardex).
// Paginación, filtro por tipo de movimiento. Se carga con @defer on viewport.
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
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { QuickFilterBarComponent, QuickFilterTab } from '@nalunpos/shared/ui';
import { InventoryMovement } from '../../interfaces/stock-level.interface';
import { StockLevelApiService } from '../../services/stock-level-api.service';

// Tipos de movimiento que corresponden al Enum del backend (InventoryMovementType)
// 1=Purchase, 2=Sale, 3=Adjustment, 4=ReturnFromCustomer, 5=ReturnToSupplier, 6=TransferOut, 7=TransferIn
const MOVEMENT_TYPE_LABELS: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: 'Compra / Entrada', color: 'text-[#1A7948]', bg: 'bg-[#EDFAF3]', border: 'border-[#86EFAC]' },
  2: { label: 'Venta / Salida', color: 'text-[#9B2C67]', bg: 'bg-[#FDF2F7]', border: 'border-[#E8A0BF]' },
  3: { label: 'Ajuste', color: 'text-[#C05621]', bg: 'bg-[#FEF3EE]', border: 'border-[#FDBA74]' },
  4: { label: 'Dev. Cliente', color: 'text-[#2A5BC7]', bg: 'bg-[#EEF5FE]', border: 'border-[#92AAE7]' },
  5: { label: 'Dev. Proveedor', color: 'text-[#1E3A5F]', bg: 'bg-[#EFF6FF]', border: 'border-[#93C5FD]' },
  6: { label: 'Traspaso Salida', color: 'text-[#5B21B6]', bg: 'bg-[#F5F3FF]', border: 'border-[#C4B5FD]' },
  7: { label: 'Traspaso Entrada', color: 'text-[#0D7377]', bg: 'bg-[#ECFDF9]', border: 'border-[#6EE7D8]' },
};

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    QuickFilterBarComponent,
  ],
  templateUrl: './kardex.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KardexComponent implements OnChanges {
  private readonly stockLevelApi = inject(StockLevelApiService);

  @Input() warehouseId: string | null = null;
  @Input() refreshTick = 0;

  // ── Estado reactivo ──
  protected readonly movements = signal<InventoryMovement[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly movTypeFilter = signal<string>('all');

  // ── Columnas ──
  protected readonly displayedColumns: string[] = [
    'fecha',
    'tipo',
    'producto',
    'cantidad',
    'referencia',
    'notas',
  ];

  // ── Tabs de filtro ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: `Todos (${this.totalCount()})`, colorVariant: 'default' },
    { key: '0', label: 'Entradas', colorVariant: 'blue' },
    { key: '1', label: 'Salidas', colorVariant: 'orchid' },
    { key: '2,3', label: 'Ajustes', colorVariant: 'default' },
    { key: '4,5', label: 'Traspasos', colorVariant: 'default' },
  ]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['warehouseId'] || changes['refreshTick']) {
      this.pageIndex.set(0);
      this.loadMovements();
    }
  }

  protected loadMovements(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.stockLevelApi
      .getInventoryMovements(this.pageIndex() + 1, this.pageSize(), this.warehouseId ?? undefined)
      .subscribe({
        next: (result) => {
          this.movements.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('No se pudo cargar el Kardex de movimientos.');
        },
      });
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadMovements();
  }

  protected onFilterChange(key: string): void {
    this.movTypeFilter.set(key);
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadMovements();
  }

  protected getMovementLabel(typeNum: number): string {
    return MOVEMENT_TYPE_LABELS[typeNum]?.label ?? `Tipo ${typeNum}`;
  }

  protected getMovementStyle(typeNum: number): { color: string; bg: string; border: string } {
    return MOVEMENT_TYPE_LABELS[typeNum] ?? { color: 'text-[#605596]', bg: 'bg-white', border: 'border-[#DEDAF4]' };
  }

  protected getQuantitySign(typeNum: number): string {
    // Tipos que suman: 0=Entrada, 2=AjustePos, 4=TraspasoEntrada, 6=DevCliente, 9=Compra
    return [0, 2, 4, 6, 9].includes(typeNum) ? '+' : '−';
  }

  protected readonly filteredMovements = computed(() => {
    const filter = this.movTypeFilter();
    const items = this.movements();
    if (filter === 'all') return items;
    const types = filter.split(',').map(Number);
    return items.filter((m) => types.includes(m.movementType));
  });
}
