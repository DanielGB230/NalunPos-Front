import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormField,
  form,
  maxLength,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AppError } from '@nalunpos/shared/data-access';
import { NotificationService } from '@nalunpos/shared/ui';
import { CreateCategoryRequest } from '../../models/category.model';
import { CategoryApiService } from '../../services/category-api.service';

interface CategoryFormModel {
  name: string;
  description: string;
}

@Component({
  selector: 'app-category-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, FormField],
  templateUrl: './category-create-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCreateFormComponent {
  protected readonly formFieldDirective = FormField;
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<CategoryCreateFormComponent>);

  // Signal Form - Angular 22
  private readonly formModel = signal<CategoryFormModel>({
    name: '',
    description: '',
  });

  protected readonly categoryForm = form(this.formModel, (fields) => {
    required(fields.name);
    minLength(fields.name, 2);
    maxLength(fields.name, 100);
    maxLength(fields.description, 500);
  });

  protected readonly nameField = this.categoryForm.name;
  protected readonly descriptionField = this.categoryForm.description;

  // Estado con Signals
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected close(saved = false): void {
    this.dialogRef.close(saved);
  }

  protected async onSubmit(): Promise<void> {
    await submit(this.categoryForm, {
      action: async () => {
        const currentModel = this.formModel();
        const request: CreateCategoryRequest = {
          name: currentModel.name,
          description: currentModel.description || null,
        };

        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.categoryApiService.createCategory(request).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.notificationService.success(
              `La categoría "${request.name}" fue creada exitosamente.`,
              'Categoría Creada'
            );
            this.close(true);
          },
          error: (error: AppError) => {
            this.isLoading.set(false);
            const msg =
              error?.message ||
              'Error al crear la categoría. Verifique los datos e intente nuevamente.';
            this.errorMessage.set(msg);
            this.notificationService.error(msg, 'Error de Creación');
          },
        });
      },
      onInvalid: () => {
        const msg = 'Por favor, ingrese un nombre de categoría válido.';
        this.notificationService.warning(msg, 'Datos Incompletos');
      },
    });
  }
}
