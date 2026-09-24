import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import {
  AdvancedFilterDrawerComponent,
  ConfirmationDialogService,
  FilterDrawerConfig,
  MetricCardConfig,
  MetricsBentoGridComponent,
  NotificationService,
  PageHeroCardComponent,
  PageHeroConfig,
  QuickFilterBarComponent,
  QuickFilterTab,
} from '@nalunpos/shared/ui';
import { Supplier } from '../../interfaces/supplier.interface';
import { SupplierApiService } from '../../services/supplier-api.service';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    // ── Dumb Components de @nalunpos/shared/ui ──
    PageHeroCardComponent,
    MetricsBentoGridComponent,
    QuickFilterBarComponent,
    AdvancedFilterDrawerComponent,
  ],
  templateUrl: './supplier-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierListComponent implements OnInit {
  private readonly supplierApi = inject(SupplierApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationDialogService);

  protected readonly displayedColumns: string[] = [
    'proveedor',
    'contacto',
    'taxId',
    'ubicacion',
    'estado',
    'acciones',
  ];

  // ── Estado reactivo (Signal-First) ──
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Estado UI de filtros ──
  protected readonly selectedStatusFilter = signal<'all' | 'active' | 'inactive'>('all');
  protected readonly showAdvancedFilters = signal(false);

  // ── Métricas derivadas de proveedores cargados ──
  protected readonly activeSuppliersCount = computed(
    () => this.suppliers().filter((s) => s.isActive).length
  );
  protected readonly inactiveSuppliersCount = computed(
    () => this.suppliers().filter((s) => !s.isActive).length
  );

  // ── Configuración del Hero (estática) ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'GESTIÓN DE COMPRAS • RED DE PROVEEDORES',
    title: 'Directorio de',
    titleHighlight: 'Proveedores',
    description:
      'Administración de relaciones comerciales, datos fiscales RUC, red de abastecimiento y directorio corporativo.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789420865/Gemini_Generated_Image_21pnr121pnr121pn_esc71v.jpg',
    imageAlt: 'Abstract crystalline 3D geometric category architecture',
    primaryAction: { label: 'Nuevo Proveedor' },
    secondaryAction: { label: 'Exportar' },
  };

  // ── Métricas (reactivas sobre signals) ──
  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Total Proveedores',
      value: this.totalCount(),
      badge: 'En catálogo',
      badgeHasArrow: true,
      topIndicator: this.totalCount(),
      progressPercent: 85,
      colorVariant: 'purple',
    },
    {
      label: 'Proveedores Activos',
      value: this.activeSuppliersCount(),
      badge: 'Operativos',
      topIndicator: '✓',
      topIndicatorIsCheck: true,
      progressPercent:
        this.totalCount() > 0
          ? Math.round((this.activeSuppliersCount() / this.totalCount()) * 100)
          : 0,
      colorVariant: 'blue',
    },
    {
      label: 'Inactivos / Suspendidos',
      value: this.inactiveSuppliersCount(),
      badge: 'Sin actividad',
      badgeHasPing: true,
      topIndicator: this.inactiveSuppliersCount(),
      progressPercent:
        this.totalCount() > 0
          ? Math.round((this.inactiveSuppliersCount() / this.totalCount()) * 100)
          : 0,
      colorVariant: 'orchid',
    },
    {
      label: 'Red Abastecimiento',
      value: '100%',
      badge: 'OPTIMIZADO',
      topIndicator: '%',
      progressPercent: 95,
      colorVariant: 'cobalt',
    },
  ]);

  // ── Tabs de filtro rápido (reactivos sobre signals) ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: `Todos (${this.totalCount()})`, colorVariant: 'default' },
    { key: 'active', label: `Activos (${this.activeSuppliersCount()})`, colorVariant: 'blue' },
    { key: 'inactive', label: `Inactivos (${this.inactiveSuppliersCount()})`, colorVariant: 'orchid' },
  ]);

  // ── Configuración del Drawer de filtros avanzados ──
  protected readonly drawerConfig: FilterDrawerConfig = {
    title: 'Filtros Avanzados',
    sections: [
      {
        label: 'Estado Comercial',
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
          { label: 'Razón Social (A-Z)', value: 'name' },
          { label: 'RUC / Tax ID', value: 'taxId' },
          { label: 'Fecha de Registro (Más reciente)', value: 'date-desc', selected: true },
        ],
      },
    ],
  };

  ngOnInit(): void {
    this.loadSuppliers();
  }

  protected loadSuppliers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filterVal = this.selectedStatusFilter();
    const isActive =
      filterVal === 'active'
        ? true
        : filterVal === 'inactive'
          ? false
          : undefined;

    this.supplierApi
      .getSuppliers(
        this.pageIndex() + 1,
        this.pageSize(),
        this.searchTerm(),
        isActive
      )
      .subscribe({
        next: (result) => {
          this.suppliers.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('No se pudieron cargar los proveedores del catálogo.');
          this.notification.error('Error al conectar con el servidor.', 'Error de carga');
        },
      });
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadSuppliers();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadSuppliers();
  }

  protected setStatusFilter(filter: string): void {
    this.selectedStatusFilter.set(filter as 'all' | 'active' | 'inactive');
    this.pageIndex.set(0);
    this.loadSuppliers();
  }

  protected toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  protected openSupplierDialog(supplier?: Supplier): void {
    const ref = this.dialog.open(SupplierFormComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
      data: { supplier },
    });

    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadSuppliers();
    });
  }

  protected onDeactivate(supplier: Supplier): void {
    const newStatus = !supplier.isActive;
    const actionTitle = newStatus ? 'Activar Proveedor' : 'Desactivar Proveedor';
    const actionLabel = newStatus ? 'activar' : 'desactivar';

    this.confirmationService
      .confirm({
        title: actionTitle,
        message: `¿Estás seguro de que deseas ${actionLabel} al proveedor "${supplier.name}"?`,
        confirmText: newStatus ? 'SÍ, ACTIVAR' : 'SÍ, DESACTIVAR',
        variant: newStatus ? 'purple' : 'orchid',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.supplierApi.changeSupplierStatus(supplier.id, newStatus).subscribe({
            next: () => {
              this.notification.success(`Proveedor ${newStatus ? 'activado' : 'desactivado'} correctamente.`, 'Éxito');
              this.loadSuppliers();
            },
            error: () => {
              this.notification.error(`No se pudo ${actionLabel} el proveedor.`, 'Error');
            },
          });
        }
      });
  }
}

