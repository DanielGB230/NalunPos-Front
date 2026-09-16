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
  FilterDrawerConfig,
  MetricCardConfig,
  MetricsBentoGridComponent,
  PageHeroCardComponent,
  PageHeroConfig,
  QuickFilterBarComponent,
  QuickFilterTab,
} from '@nalunpos/shared/ui';
import { TenantDto } from '../../models/tenant.model';
import { TenantApiService } from '../../services/tenant-api.service';
import { TenantCreateFormComponent } from '../tenant-create/tenant-create-form.component';

@Component({
  selector: 'app-tenant-list',
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
  templateUrl: './tenant-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantListComponent implements OnInit {
  private readonly tenantApiService = inject(TenantApiService);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns: string[] = [
    'name',
    'documentNumber',
    'subdomain',
    'status',
    'createdAtUtc',
    'actions',
  ];

  // ── Estado reactivo (Signal-First) ──
  protected readonly tenants = signal<TenantDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Estado UI de filtros ──
  protected readonly selectedStatusFilter = signal<'all' | 'Active' | 'Pending' | 'Paused'>('all');
  protected readonly showAdvancedFilters = signal(false);

  // ── Configuración del Hero (estática) ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'GOBERNANZA MULTI-TENANT • LATAM CORE',
    title: 'Gestión de',
    titleHighlight: 'Tenants',
    description:
      'Control global de empresas, aprovisionamiento de bases de datos aisladas y monitoreo de salud del ecosistema NalunPOS.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789420865/Gemini_Generated_Image_21pnr121pnr121pn_esc71v.jpg',
    imageAlt: 'Abstract crystalline 3D geometric multi-tenant architecture',
    primaryAction: { label: 'Nuevo Tenant' },
    secondaryAction: { label: 'Exportar' },
  };

  // ── Métricas (reactivas sobre totalCount) ──
  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Total Registrados',
      value: this.totalCount(),
      badge: '+3 este mes',
      badgeHasArrow: true,
      topIndicator: this.totalCount(),
      progressPercent: 85,
      colorVariant: 'purple',
    },
    {
      label: 'Shards & DB Clúster',
      value: '14',
      valueSuffix: '/ 14',
      badge: '0.4ms latencia',
      topIndicator: '✓',
      topIndicatorIsCheck: true,
      progressPercent: 100,
      colorVariant: 'blue',
    },
    {
      label: 'En Cola / Provisioning',
      value: 5,
      badge: '12 Operativos',
      badgeHasPing: true,
      topIndicator: 5,
      progressPercent: 38,
      colorVariant: 'orchid',
    },
    {
      label: 'Facturación MRR',
      value: '$38,450',
      badge: 'USD/mes',
      topIndicator: '$',
      progressPercent: 92,
      colorVariant: 'cobalt',
    },
  ]);

  // ── Tabs de filtro rápido (reactivos sobre totalCount) ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: `Todos (${this.totalCount()})`, colorVariant: 'default' },
    { key: 'Active', label: 'Activos (12)', colorVariant: 'blue' },
    { key: 'Pending', label: 'Pending Provisioning (5)', colorVariant: 'orchid', hasPing: true },
    { key: 'Paused', label: 'En Pausa (0)', colorVariant: 'default' },
  ]);

  // ── Configuración del Drawer de filtros avanzados (estática) ──
  protected readonly drawerConfig: FilterDrawerConfig = {
    title: 'Filtros Avanzados',
    sections: [
      {
        label: 'Estado de Provisión',
        type: 'checkboxes',
        note: 'Multi-selección',
        options: [
          { label: 'Todos', value: 'all', checked: true },
          { label: 'Activos', value: 'Active', checked: true, colorVariant: 'blue' },
          { label: 'Provisioning', value: 'Pending', checked: true, colorVariant: 'orchid' },
          { label: 'En Pausa', value: 'Paused' },
        ],
      },
      {
        label: 'Shard / Región de Datos',
        type: 'select',
        selectOptions: [
          { label: 'Todas las Regiones (Global)', value: 'all' },
          { label: 'Cluster-US-East-1 (Virginia)', value: 'us-east', selected: true },
          { label: 'Cluster-BR-South-1 (São Paulo)', value: 'br-south' },
          { label: 'Cluster-EU-Central-1 (Frankfurt)', value: 'eu-central' },
          { label: 'Dedicated-Shard-LATAM', value: 'latam-dedicated' },
        ],
      },
      {
        label: 'Plan / Nivel de Licencia',
        type: 'checkboxes',
        options: [
          { label: 'Enterprise Plus', value: 'enterprise', checked: true },
          { label: 'Professional Shard', value: 'professional', checked: true },
        ],
      },
      {
        label: 'Uso de Almacenamiento DB',
        type: 'range',
        rangeConfig: {
          min: 1,
          max: 50,
          defaultValue: 15,
          unit: 'GB',
          ticks: ['1 GB', '25 GB', '50 GB'],
        },
      },
    ],
  };

  ngOnInit(): void {
    this.loadTenants();
  }

  protected loadTenants(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.tenantApiService
      .getTenants(this.pageIndex() + 1, this.pageSize(), this.searchTerm())
      .subscribe({
        next: (result) => {
          this.tenants.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: (error: AppError) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.message || 'No se pudieron cargar los Tenants de la plataforma.'
          );
        },
      });
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadTenants();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTenants();
  }

  protected setStatusFilter(filter: string): void {
    this.selectedStatusFilter.set(filter as 'all' | 'Active' | 'Pending' | 'Paused');
  }

  protected toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  protected openCreateModal(): void {
    const dialogRef = this.dialog.open(TenantCreateFormComponent, {
      width: '672px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.loadTenants();
    });
  }
}
