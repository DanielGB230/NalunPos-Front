import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import {
  PageHeroCardComponent,
  PageHeroConfig,
  MetricsBentoGridComponent,
  MetricCardConfig,
  QuickFilterBarComponent,
  QuickFilterTab,
  NotificationService,
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
    PageHeroCardComponent,
    MetricsBentoGridComponent,
    QuickFilterBarComponent,
  ],
  templateUrl: './supplier-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierListComponent implements OnInit {
  private readonly supplierApi = inject(SupplierApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  // ── Estado ──
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Filtros y paginación ──
  protected readonly activeFilter = signal<string>('all'); // all | active | inactive
  protected readonly searchTerm = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly displayedColumns = [
    'proveedor',
    'contacto',
    'taxId',
    'ubicacion',
    'estado',
    'acciones',
  ];

  // ── Tabs para QuickFilterBar ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: 'Todos' },
    { key: 'active', label: 'Activos' },
    { key: 'inactive', label: 'Inactivos' },
  ]);

  // ── Hero Config ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'GESTIÓN DE COMPRAS • RED DE PROVEEDORES',
    title: 'Directorio de',
    titleHighlight: 'Proveedores',
    description:
      'Administre sus relaciones comerciales, datos fiscales y red de abastecimiento corporativo.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789483543082/inventory_hero_1790003866378_yscqbn.png',
    primaryAction: { label: 'Nuevo Proveedor' },
  };

  // ── Métricas ──
  protected readonly activeSuppliersCount = computed(
    () => this.suppliers().filter((s) => s.isActive).length
  );

  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Proveedores Registrados',
      value: this.totalCount(),
      badge: 'En catálogo',
      topIndicator: '🏢',
      progressPercent: 100,
      colorVariant: 'cobalt',
    },
    {
      label: 'Proveedores Activos',
      value: this.activeSuppliersCount(),
      badge: 'Operativos',
      badgeHasArrow: true,
      topIndicator: '✓',
      progressPercent:
        this.suppliers().length > 0
          ? Math.round((this.activeSuppliersCount() / this.suppliers().length) * 100)
          : 0,
      colorVariant: 'purple',
    },
  ]);

  ngOnInit(): void {
    this.loadSuppliers();
  }

  protected loadSuppliers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const isActiveOnly =
      this.activeFilter() === 'active'
        ? true
        : this.activeFilter() === 'inactive'
        ? false
        : undefined;

    this.supplierApi
      .getSuppliers(
        this.pageIndex() + 1,
        this.pageSize(),
        this.searchTerm(),
        isActiveOnly
      )
      .subscribe({
        next: (result) => {
          this.suppliers.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('No se pudieron cargar los proveedores.');
          this.notification.error('Error al conectar con el servidor.', 'Error de carga');
        },
      });
  }

  protected onFilterChange(tabId: string): void {
    this.activeFilter.set(tabId);
    this.pageIndex.set(0);
    this.loadSuppliers();
  }

  protected onSearchChange(query: string): void {
    this.searchTerm.set(query);
    this.pageIndex.set(0);
    this.loadSuppliers();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadSuppliers();
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
    if (confirm(`¿Está seguro de desactivar al proveedor ${supplier.name}?`)) {
      this.supplierApi.deactivateSupplier(supplier.id).subscribe({
        next: () => {
          this.notification.success('Proveedor desactivado correctamente.', 'Éxito');
          this.loadSuppliers();
        },
        error: () => {
          this.notification.error('No se pudo desactivar el proveedor.', 'Error');
        },
      });
    }
  }
}
