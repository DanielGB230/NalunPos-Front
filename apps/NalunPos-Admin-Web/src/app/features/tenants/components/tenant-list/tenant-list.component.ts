import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AppError } from '@nalunpos/shared/data-access';
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

  // Estado reactivo con Signals (Angular 22)
  protected readonly tenants = signal<TenantDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Estados visuales interactivos para simulación de filtros y panel lateral
  protected readonly selectedStatusFilter = signal<'all' | 'Active' | 'Pending' | 'Paused'>('all');
  protected readonly showAdvancedFilters = signal(false);

  ngOnInit(): void {
    this.loadTenants();
  }

  protected loadTenants(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const pageNumber = this.pageIndex() + 1;
    const currentSize = this.pageSize();
    const currentTerm = this.searchTerm();

    this.tenantApiService.getTenants(pageNumber, currentSize, currentTerm).subscribe({
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

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.pageIndex.set(0);
    this.loadTenants();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTenants();
  }

  protected setStatusFilter(filter: 'all' | 'Active' | 'Pending' | 'Paused'): void {
    this.selectedStatusFilter.set(filter);
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
      if (result) {
        this.loadTenants();
      }
    });
  }
}

