import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AdvancedFilterDrawerComponent,
  FilterDrawerConfig,
  MetricCardConfig,
  MetricsBentoGridComponent,
  NotificationService,
  PageHeroCardComponent,
  PageHeroConfig,
  QuickFilterBarComponent,
  QuickFilterTab,
} from '@nalunpos/shared/ui';
import { Warehouse } from '../../interfaces/warehouse.interface';
import { WarehouseApiService } from '../../services/warehouse-api.service';
import { WarehouseFormComponent } from '../warehouse-form/warehouse-form.component';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    // ── Dumb Components de @nalunpos/shared/ui ──
    PageHeroCardComponent,
    MetricsBentoGridComponent,
    QuickFilterBarComponent,
    AdvancedFilterDrawerComponent,
  ],
  templateUrl: './warehouse-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseListComponent implements OnInit {
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  protected readonly displayedColumns: string[] = [
    'almacen',
    'predeterminado',
    'descripcion',
    'creado',
    'estado',
    'acciones',
  ];

  // ── Estado reactivo (Signal-First) ──
  protected readonly warehouses = signal<Warehouse[]>([]);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Estado UI de filtros ──
  protected readonly selectedStatusFilter = signal<'all' | 'active' | 'inactive'>('all');
  protected readonly showAdvancedFilters = signal(false);

  // ── Métricas derivadas ──
  protected readonly totalCount = computed(() => this.filteredWarehouses().length);
  protected readonly activeCount = computed(
    () => this.warehouses().filter((w) => w.isActive).length
  );
  protected readonly inactiveCount = computed(
    () => this.warehouses().filter((w) => !w.isActive).length
  );
  protected readonly defaultWarehouse = computed(
    () => this.warehouses().find((w) => w.isDefault)
  );

  // ── Filtrado local en cliente ──
  protected readonly filteredWarehouses = computed(() => {
    let list = this.warehouses();

    // Filtro por tab de estado
    const status = this.selectedStatusFilter();
    if (status === 'active') {
      list = list.filter((w) => w.isActive);
    } else if (status === 'inactive') {
      list = list.filter((w) => !w.isActive);
    }

    // Filtro por término de búsqueda
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          (w.description && w.description.toLowerCase().includes(term))
      );
    }

    return list;
  });

  // ── Paginación computada sobre lista filtrada ──
  protected readonly paginatedWarehouses = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredWarehouses().slice(start, start + this.pageSize());
  });

  // ── Configuración del Hero ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'LOGÍSTICA • BODEGAS Y CENTROS DE DISTRIBUCIÓN',
    title: 'Gestión de',
    titleHighlight: 'Almacenes',
    description:
      'Administración de centros de almacenamiento, stock por bodega y configuración de almacén predeterminado del tenant.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789420865/Gemini_Generated_Image_21pnr121pnr121pn_esc71v.jpg',
    imageAlt: 'Warehouse management geometric design',
    primaryAction: { label: 'Nuevo Almacén' },
    secondaryAction: { label: 'Exportar' },
  };

  // ── Métricas para Bento Grid ──
  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Total Almacenes',
      value: this.warehouses().length,
      badge: 'Registrados',
      badgeHasArrow: true,
      topIndicator: this.warehouses().length,
      progressPercent: 100,
      colorVariant: 'purple',
    },
    {
      label: 'Almacenes Activos',
      value: this.activeCount(),
      badge: 'Operativos',
      topIndicator: '✓',
      topIndicatorIsCheck: true,
      progressPercent:
        this.warehouses().length > 0
          ? Math.round((this.activeCount() / this.warehouses().length) * 100)
          : 0,
      colorVariant: 'blue',
    },
    {
      label: 'Inactivos / Suspendidos',
      value: this.inactiveCount(),
      badge: 'Sin actividad',
      badgeHasPing: true,
      topIndicator: this.inactiveCount(),
      progressPercent:
        this.warehouses().length > 0
          ? Math.round((this.inactiveCount() / this.warehouses().length) * 100)
          : 0,
      colorVariant: 'orchid',
    },
    {
      label: 'Predeterminado Actual',
      value: this.defaultWarehouse()?.name ?? 'No asignado',
      badge: 'PRINCIPAL',
      topIndicator: '★',
      progressPercent: 100,
      colorVariant: 'cobalt',
    },
  ]);

  // ── Tabs de Filtro Rápido ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: `Todos (${this.warehouses().length})`, colorVariant: 'default' },
    { key: 'active', label: `Activos (${this.activeCount()})`, colorVariant: 'blue' },
    { key: 'inactive', label: `Inactivos (${this.inactiveCount()})`, colorVariant: 'orchid' },
  ]);

  // ── Configuración del Drawer de Filtros Avanzados ──
  protected readonly drawerConfig: FilterDrawerConfig = {
    title: 'Filtros Avanzados',
    sections: [
      {
        label: 'Estado del Almacén',
        type: 'checkboxes',
        note: 'Selección múltiple',
        options: [
          { label: 'Todos', value: 'all', checked: true },
          { label: 'Activos', value: 'active', checked: true, colorVariant: 'blue' },
          { label: 'Inactivos', value: 'inactive', colorVariant: 'orchid' },
        ],
      },
      {
        label: 'Ordenar Por',
        type: 'select',
        selectOptions: [
          { label: 'Nombre (A-Z)', value: 'name' },
          { label: 'Predeterminado Primero', value: 'default', selected: true },
        ],
      },
    ],
  };

  ngOnInit(): void {
    this.loadWarehouses();
  }

  protected loadWarehouses(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.warehouseApi.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudieron cargar los almacenes del catálogo.');
        this.notification.error('Error al conectar con el servidor.', 'Error de carga');
      },
    });
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected setStatusFilter(filter: string): void {
    this.selectedStatusFilter.set(filter as 'all' | 'active' | 'inactive');
    this.pageIndex.set(0);
  }

  protected toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  protected openWarehouseDialog(warehouse?: Warehouse): void {
    const ref = this.dialog.open(WarehouseFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
      data: { warehouse },
    });

    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadWarehouses();
    });
  }
}
