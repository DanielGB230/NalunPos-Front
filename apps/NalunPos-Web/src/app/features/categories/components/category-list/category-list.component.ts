import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AppError } from '@nalunpos/shared/data-access';
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
import { CategoryDto } from '../../models/category.model';
import { CategoryApiService } from '../../services/category-api.service';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    // ── Dumb Components de @nalunpos/shared/ui ──
    PageHeroCardComponent,
    MetricsBentoGridComponent,
    QuickFilterBarComponent,
    AdvancedFilterDrawerComponent,
  ],
  templateUrl: './category-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationDialogService);

  protected readonly displayedColumns: string[] = [
    'name',
    'description',
    'isActive',
    'createdAtUtc',
    'actions',
  ];

  // ── Estado reactivo (Signal-First) ──
  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Estado UI de filtros ──
  protected readonly selectedStatusFilter = signal<'all' | 'Active' | 'Inactive'>('all');
  protected readonly showAdvancedFilters = signal(false);

  // ── Métricas derivadas de categorías cargadas ──
  protected readonly activeCount = computed(() => this.categories().filter((c) => c.isActive).length);
  protected readonly inactiveCount = computed(() => this.categories().filter((c) => !c.isActive).length);

  // ── Configuración del Hero (estática) ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'CATÁLOGO DE PRODUCTOS • POS OPERATIVO',
    title: 'Gestión de',
    titleHighlight: 'Categorías',
    description:
      'Organización del inventario, clasificación de líneas de productos y estructuración del catálogo comercial.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789420865/Gemini_Generated_Image_21pnr121pnr121pn_esc71v.jpg',
    imageAlt: 'Abstract crystalline 3D geometric category architecture',
    primaryAction: { label: 'Nueva Categoría' },
    secondaryAction: { label: 'Exportar' },
  };

  // ── Métricas (reactivas sobre signals) ──
  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Total Categorías',
      value: this.totalCount(),
      badge: 'En catálogo',
      badgeHasArrow: true,
      topIndicator: this.totalCount(),
      progressPercent: 85,
      colorVariant: 'purple',
    },
    {
      label: 'Categorías Activas',
      value: this.activeCount(),
      badge: 'En POS',
      topIndicator: '✓',
      topIndicatorIsCheck: true,
      progressPercent: this.totalCount() > 0 ? Math.round((this.activeCount() / this.totalCount()) * 100) : 0,
      colorVariant: 'blue',
    },
    {
      label: 'Inactivas / Borrador',
      value: this.inactiveCount(),
      badge: 'Sin publicar',
      badgeHasPing: true,
      topIndicator: this.inactiveCount(),
      progressPercent: this.totalCount() > 0 ? Math.round((this.inactiveCount() / this.totalCount()) * 100) : 0,
      colorVariant: 'orchid',
    },
    {
      label: 'Salud de Catálogo',
      value: '100%',
      badge: 'OPTIMIZADO',
      topIndicator: '%',
      progressPercent: 95,
      colorVariant: 'cobalt',
    },
  ]);

  // ── Tabs de filtro rápido (reactivos sobre signals) ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: `Todas (${this.totalCount()})`, colorVariant: 'default' },
    { key: 'Active', label: `Activas (${this.activeCount()})`, colorVariant: 'blue' },
    { key: 'Inactive', label: `Inactivas (${this.inactiveCount()})`, colorVariant: 'orchid' },
  ]);

  // ── Configuración del Drawer de filtros avanzados (estática) ──
  protected readonly drawerConfig: FilterDrawerConfig = {
    title: 'Filtros Avanzados',
    sections: [
      {
        label: 'Estado Comercial',
        type: 'checkboxes',
        note: 'Selección múltiple',
        options: [
          { label: 'Todas', value: 'all', checked: true },
          { label: 'Activas', value: 'Active', checked: true, colorVariant: 'blue' },
          { label: 'Inactivas', value: 'Inactive', colorVariant: 'orchid' },
        ],
      },
      {
        label: 'Ordenar Por',
        type: 'select',
        selectOptions: [
          { label: 'Nombre (A-Z)', value: 'name' },
          { label: 'Fecha de Creación (Más reciente)', value: 'date-desc', selected: true },
          { label: 'Fecha de Creación (Más antigua)', value: 'date-asc' },
        ],
      },
    ],
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filterVal = this.selectedStatusFilter();
    const isActiveOnly =
      filterVal === 'Active'
        ? true
        : filterVal === 'Inactive'
          ? false
          : undefined;

    this.categoryApiService
      .getCategories(this.pageIndex() + 1, this.pageSize(), this.searchTerm(), isActiveOnly)
      .subscribe({
        next: (result) => {
          this.categories.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: (error: AppError) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.message || 'No se pudieron cargar las categorías del tenant activo.'
          );
        },
      });
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadCategories();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCategories();
  }

  protected setStatusFilter(filter: string): void {
    this.selectedStatusFilter.set(filter as 'all' | 'Active' | 'Inactive');
    this.pageIndex.set(0);
    this.loadCategories();
  }

  protected toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  protected openCategoryDialog(category?: CategoryDto): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
      data: { category },
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadCategories();
    });
  }

  protected onDeactivate(category: CategoryDto): void {
    const newStatus = !category.isActive;
    const actionTitle = newStatus ? 'Activar Categoría' : 'Desactivar Categoría';
    const actionLabel = newStatus ? 'activar' : 'desactivar';

    this.confirmationService
      .confirm({
        title: actionTitle,
        message: `¿Estás seguro de que deseas ${actionLabel} la categoría "${category.name}"?`,
        confirmText: newStatus ? 'SÍ, ACTIVAR' : 'SÍ, DESACTIVAR',
        variant: newStatus ? 'purple' : 'orchid',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.categoryApiService.changeCategoryStatus(category.id, newStatus).subscribe({
            next: () => {
              this.notification.success(`La categoría "${category.name}" fue ${newStatus ? 'activada' : 'desactivada'} correctamente.`, 'Éxito');
              this.loadCategories();
            },
            error: (err) => {
              const detail = err?.error?.detail || err?.error?.message || `No se pudo ${actionLabel} la categoría.`;
              this.notification.error(detail, 'Error');
            },
          });
        }
      });
  }
}
