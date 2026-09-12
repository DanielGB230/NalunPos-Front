import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoryApiService } from '../../services/category-api.service';
import { CategoryDto } from '../../models/category.model';
import { CategoryCreateFormComponent } from '../category-create-form/category-create-form.component';
import { AppError } from '@nalunpos/shared/data-access';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './category-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly dialog = inject(MatDialog);

  // Estado con Signals (100% Signal-based)
  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const pageNumber = this.pageIndex() + 1;
    const currentSize = this.pageSize();
    const currentTerm = this.searchTerm();

    this.categoryApiService.getCategories(pageNumber, currentSize, currentTerm).subscribe({
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

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.pageIndex.set(0);
    this.loadCategories();
  }

  protected openCreateModal(): void {
    const dialogRef = this.dialog.open(CategoryCreateFormComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) {
        this.loadCategories();
      }
    });
  }
}
