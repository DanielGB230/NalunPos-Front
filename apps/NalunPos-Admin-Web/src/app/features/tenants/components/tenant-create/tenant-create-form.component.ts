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
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@nalunpos/shared/ui';
import { CreateTenantRequest } from '../../models/tenant.model';
import { TenantApiService } from '../../services/tenant-api.service';

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
  private readonly notificationService = inject(NotificationService);
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
  protected readonly showPassword = signal(false);

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected close(saved = false): void {
    this.dialogRef.close(saved);
  }

  protected async onSubmit(): Promise<void> {
    console.log('onSubmit triggered. Current model:', this.formModel());

    await submit(this.tenantForm, {
      action: async () => {
        console.log('Form is valid! Sending request...');
        const currentModel = this.formModel();

        const request: CreateTenantRequest = {
          name: currentModel.name,
          documentNumber: currentModel.documentNumber,
          adminEmail: currentModel.adminEmail,
          adminPassword: currentModel.adminPassword,
        };

        this.isLoading.set(true);

        this.tenantApiService.createTenant(request).subscribe({
          next: (tenantId) => {
            console.log('Tenant creado exitosamente con ID:', tenantId);
            this.isLoading.set(false);
            this.notificationService.success(
              `El tenant ${request.name} fue aprovisionado exitosamente.`,
              'Tenant Aprovisionado'
            );
            this.close(true);
          },
          error: (error: any) => {
            console.error('Request failed', error);
            this.isLoading.set(false);
            const msg =
              error?.message ||
              error?.detail ||
              error?.title ||
              'Error al aprovisionar el Tenant. Verifique los datos ingresados.';
            this.notificationService.error(msg, 'Error de Aprovisionamiento');
          },
        });
      },
      onInvalid: () => {
        console.warn('Formulario inválido:', this.formModel());
        const msg = 'Por favor, complete todos los campos obligatorios respetando el formato requerido.';
        this.notificationService.warning(msg, 'Datos Incompletos');
      },
    });
  }
}
