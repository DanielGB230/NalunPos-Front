// =============================================================================
// InventarioShellComponent — NalunPos-Web / features/inventario
// Smart Shell: orquesta el módulo de inventario con 4 tabs principales.
// Estado global: almacenes cargados, tab activo, señal de refresco.
// Angular 22 — Zoneless — Standalone — Tailwind v4 only
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  PageHeroCardComponent,
  PageHeroConfig,
  MetricsBentoGridComponent,
  MetricCardConfig,
  NotificationService,
} from '@nalunpos/shared/ui';
import { Warehouse } from '../../interfaces/warehouse.interface';
import { WarehouseApiService } from '../../services/warehouse-api.service';
import { StockListComponent } from '../stock-list/stock-list.component';
import { KardexComponent } from '../kardex/kardex.component';
// Modales cargados con MatDialog.open() — NO van en imports[]
import { StockAdjustmentFormComponent } from '../stock-adjustment-form/stock-adjustment-form.component';
import { StockTransferFormComponent } from '../stock-transfer-form/stock-transfer-form.component';

export type InventarioTab = 'stock' | 'kardex' | 'ajustes' | 'traspasos';

@Component({
  selector: 'app-inventario-shell',
  standalone: true,
  imports: [
    MatDialogModule,
    PageHeroCardComponent,
    MetricsBentoGridComponent,
    StockListComponent,
    KardexComponent,
  ],
  templateUrl: './inventario-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioShellComponent implements OnInit {
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  // ── Estado reactivo ──
  protected readonly activeTab = signal<InventarioTab>('stock');
  protected readonly warehouses = signal<Warehouse[]>([]);
  protected readonly selectedWarehouseId = signal<string | null>(null);
  protected readonly isLoadingWarehouses = signal(false);
  protected readonly refreshTick = signal(0); // bump para forzar reload en hijos

  // ── Lógica condicional: Traspasos oculto si sólo hay 1 almacén ──
  protected readonly canTransfer = computed(() => this.warehouses().length > 1);

  // ── Métricas derivadas ──
  protected readonly totalWarehouses = computed(() => this.warehouses().length);
  protected readonly activeWarehouses = computed(
    () => this.warehouses().filter((w) => w.isActive).length
  );

  // ── Hero Config ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'CONTROL DE STOCK • GESTIÓN DE ALMACENES',
    title: 'Centro de',
    titleHighlight: 'Inventario',
    description:
      'Control de stock en tiempo real, trazabilidad de movimientos, ajustes de inventario y traspasos entre almacenes.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789483543082/inventory_hero_1790003866378_yscqbn.png',
    imageAlt: 'Visualización 3D de almacenes y contenedores de inventario',
    primaryAction: { label: 'Nuevo Ajuste' },
    secondaryAction: { label: 'Traspaso' },
  };

  // ── Métricas ──
  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Almacenes Activos',
      value: this.activeWarehouses(),
      badge: 'Operativos',
      badgeHasArrow: true,
      topIndicator: this.totalWarehouses(),
      progressPercent: this.totalWarehouses() > 0
        ? Math.round((this.activeWarehouses() / this.totalWarehouses()) * 100)
        : 0,
      colorVariant: 'purple',
    },
    {
      label: 'Total Almacenes',
      value: this.totalWarehouses(),
      badge: 'Configurados',
      topIndicator: '⬡',
      progressPercent: 100,
      colorVariant: 'blue',
    },
    {
      label: 'Multi-Almacén',
      value: this.canTransfer() ? 'Activo' : 'Simple',
      badge: this.canTransfer() ? 'Traspasos ON' : 'Un almacén',
      topIndicator: this.canTransfer() ? '✓' : '—',
      topIndicatorIsCheck: this.canTransfer(),
      progressPercent: this.canTransfer() ? 100 : 30,
      colorVariant: this.canTransfer() ? 'cobalt' : 'orchid',
    },
    {
      label: 'Trazabilidad',
      value: '100%',
      badge: 'Kardex Activo',
      topIndicator: '%',
      progressPercent: 100,
      colorVariant: 'cobalt',
    },
  ]);

  ngOnInit(): void {
    this.loadWarehouses();
  }

  private loadWarehouses(): void {
    this.isLoadingWarehouses.set(true);
    this.warehouseApi.getWarehouses().subscribe({
      next: (wh) => {
        this.warehouses.set(wh);
        const defaultWh = wh.find((w) => w.isDefault) ?? wh[0];
        if (defaultWh) this.selectedWarehouseId.set(defaultWh.id);
        this.isLoadingWarehouses.set(false);
      },
      error: () => {
        this.isLoadingWarehouses.set(false);
        this.notification.error('No se pudieron cargar los almacenes.', 'Error de conexión');
      },
    });
  }

  protected setTab(tab: InventarioTab): void {
    this.activeTab.set(tab);
  }

  protected onSelectWarehouse(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedWarehouseId.set(id);
    this.refreshTick.update((v) => v + 1);
  }

  protected openAdjustmentDialog(): void {
    const warehouseId = this.selectedWarehouseId();
    if (!warehouseId) {
      this.notification.warning('Seleccione un almacén primero.', 'Sin selección');
      return;
    }
    const ref = this.dialog.open(StockAdjustmentFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
      data: { warehouseId, warehouses: this.warehouses() },
    });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.refreshTick.update((v) => v + 1);
    });
  }

  protected openTransferDialog(): void {
    if (!this.canTransfer()) {
      this.notification.warning(
        'Se necesitan al menos 2 almacenes para realizar un traspaso.',
        'Traspaso no disponible'
      );
      return;
    }
    const ref = this.dialog.open(StockTransferFormComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
      data: { warehouses: this.warehouses() },
    });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.refreshTick.update((v) => v + 1);
    });
  }
}
