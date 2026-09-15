import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  form,
  submit,
  required,
  pattern,
  minLength,
  FormField,
} from '@angular/forms/signals';
import { TenantApiService } from '../../services/tenant-api.service';
import { CreateTenantRequest } from '../../models/tenant.model';
import { AppError } from '@nalunpos/shared/data-access';

interface TenantFormModel {
  name: string;
  documentNumber: string;
  adminEmail: string;
  adminPassword: string;
}

@Component({
  selector: 'app-tenant-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, FormField],
  templateUrl: './tenant-create-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantCreateFormComponent {
  protected readonly formFieldDirective = FormField;
  private readonly tenantApiService = inject(TenantApiService);
  private readonly dialogRef = inject(MatDialogRef<TenantCreateFormComponent>);

  // Signal Form - Angular 22
  private readonly formModel = signal<TenantFormModel>({
    name: '',
    documentNumber: '',
    adminEmail: '',
    adminPassword: '',
  });

  protected readonly tenantForm = form(this.formModel, (fields) => {
    required(fields.name);
    required(fields.documentNumber);
    required(fields.adminEmail);
    pattern(fields.adminEmail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    required(fields.adminPassword);
    minLength(fields.adminPassword, 8);
    pattern(fields.adminPassword, /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/);
  });

  protected readonly nameField = this.tenantForm.name;
  protected readonly documentNumberField = this.tenantForm.documentNumber;
  protected readonly adminEmailField = this.tenantForm.adminEmail;
  protected readonly adminPasswordField = this.tenantForm.adminPassword;

  // Estado del componente con Signals
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected close(saved = false): void {
    this.dialogRef.close(saved);
  }

  protected async onSubmit(): Promise<void> {
    await submit(this.tenantForm, async () => {
      const currentModel = this.formModel();

      const request: CreateTenantRequest = {
        name: currentModel.name,
        documentNumber: currentModel.documentNumber,
        adminEmail: currentModel.adminEmail,
        adminPassword: currentModel.adminPassword,
      };

      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.tenantApiService.createTenant(request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.close(true);
        },
        error: (error: AppError) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.message || 'Error al aprovisionar el Tenant. Verifique los datos ingresados.'
          );
        },
      });
    });
  }
}
