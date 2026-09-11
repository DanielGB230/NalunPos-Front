import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TenantApiService } from '../../services/tenant-api.service';
import { TenantDto } from '../../models/tenant.model';
import { TenantCreateFormComponent } from '../tenant-create/tenant-create-form.component';
import { AppError } from '@nalunpos/shared/data-access';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatDialogModule],
  templateUrl: './tenant-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantListComponent implements OnInit {
  private readonly tenantApiService = inject(TenantApiService);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns: string[] = [
    'name',
    'documentNumber',
    'status',
    'createdAtUtc',
    'actions',
  ];

  // Estado con Signals
  protected readonly tenants = signal<TenantDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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

  protected openCreateModal(): void {
    const dialogRef = this.dialog.open(TenantCreateFormComponent, {
      width: '560px',
      maxWidth: '95vw',
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
