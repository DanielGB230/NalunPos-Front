import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@nalunpos/shared/ui';
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../interfaces/category.interface';
import { CategoryApiService } from '../../services/category-api.service';

import { FormsModule } from '@angular/forms';

export interface CategoryDialogData {
  category?: CategoryDto;
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './category-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<CategoryFormComponent>);
  public readonly data = inject<CategoryDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly isEditing = signal(!!this.data?.category);
  protected readonly isSaving = signal(false);

  // ── Signals de Estado Formulario (Zero ReactiveFormsModule) ──
  protected readonly name = signal(this.data?.category?.name ?? '');
  protected readonly description = signal(this.data?.category?.description ?? '');

  protected onSubmit(): void {
    if (this.isSaving()) return;

    if (!this.name().trim()) {
      this.notification.warning('Por favor ingrese un nombre de categoría válido.', 'Formulario Incompleto');
      return;
    }

    if (this.name().trim().length < 2) {
      this.notification.warning('El nombre de la categoría debe tener al menos 2 caracteres.', 'Nombre Inválido');
      return;
    }

    this.isSaving.set(true);

    const formValue = {
      name: this.name().trim(),
      description: this.description().trim() || null,
    };

    if (this.isEditing() && this.data?.category) {
      const updateReq: UpdateCategoryRequest = {
        id: this.data.category.id,
        ...formValue,
        isActive: this.data.category.isActive ?? true,
      };
      this.categoryApi.updateCategory(this.data.category.id, updateReq).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notification.success(`La categoría "${formValue.name}" se actualizó correctamente.`, 'Éxito');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          const detail = err?.error?.detail || err?.error?.message || 'Error al conectar con el servidor.';
          this.notification.error(detail, 'Error');
        },
      });
    } else {
      const createReq: CreateCategoryRequest = { ...formValue };
      this.categoryApi.createCategory(createReq).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notification.success(`La categoría "${formValue.name}" fue creada exitosamente.`, 'Éxito');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          const detail = err?.error?.detail || err?.error?.message || 'Error al conectar con el servidor.';
          this.notification.error(detail, 'Error');
        },
      });
    }
  }

  protected onClose(): void {
    this.dialogRef.close(false);
  }
}
