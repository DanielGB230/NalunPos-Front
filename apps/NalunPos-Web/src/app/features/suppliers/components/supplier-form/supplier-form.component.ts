import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '@nalunpos/shared/ui';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../../interfaces/supplier.interface';
import { SupplierApiService } from '../../services/supplier-api.service';

export interface SupplierDialogData {
  supplier?: Supplier;
}

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './supplier-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierFormComponent {
  private readonly supplierApi = inject(SupplierApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<SupplierFormComponent>);
  public readonly data = inject<SupplierDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly isEditing = signal(!!this.data?.supplier);
  protected readonly isSaving = signal(false);

  // ── Signals de Estado Formulario (Zero ReactiveFormsModule) ──
  protected readonly name = signal(this.data?.supplier?.name ?? '');
  protected readonly contactName = signal(this.data?.supplier?.contactName ?? '');
  protected readonly email = signal(this.data?.supplier?.email ?? '');
  protected readonly phone = signal(this.data?.supplier?.phone ?? '');
  protected readonly taxId = signal(this.data?.supplier?.taxId ?? '');
  protected readonly taxCountryCode = signal(this.data?.supplier?.taxCountryCode ?? 'PE');
  protected readonly street = signal(this.data?.supplier?.street ?? '');
  protected readonly city = signal(this.data?.supplier?.city ?? '');
  protected readonly zipCode = signal(this.data?.supplier?.zipCode ?? '');
  protected readonly country = signal(this.data?.supplier?.country ?? 'Perú');

  protected onSubmit(): void {
    if (
      !this.name().trim() ||
      !this.contactName().trim() ||
      !this.email().trim() ||
      !this.phone().trim() ||
      !this.taxId().trim() ||
      !this.street().trim() ||
      !this.city().trim() ||
      !this.zipCode().trim() ||
      !this.country().trim()
    ) {
      this.notification.warning('Por favor complete todos los campos obligatorios.', 'Formulario Incompleto');
      return;
    }

    this.isSaving.set(true);

    const formValue = {
      name: this.name().trim(),
      contactName: this.contactName().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      taxId: this.taxId().trim(),
      taxCountryCode: this.taxCountryCode().trim(),
      street: this.street().trim(),
      city: this.city().trim(),
      zipCode: this.zipCode().trim(),
      country: this.country().trim(),
    };

    if (this.isEditing() && this.data?.supplier) {
      const updateReq: UpdateSupplierRequest = {
        id: this.data.supplier.id,
        ...formValue,
      };
      this.supplierApi.updateSupplier(this.data.supplier.id, updateReq).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notification.success('Proveedor actualizado correctamente.', 'Éxito');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notification.error(err?.error?.detail || 'No se pudo actualizar el proveedor.', 'Error');
        },
      });
    } else {
      const createReq: CreateSupplierRequest = { ...formValue };
      this.supplierApi.createSupplier(createReq).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notification.success('Proveedor registrado correctamente.', 'Éxito');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notification.error(err?.error?.detail || 'No se pudo registrar el proveedor.', 'Error');
        },
      });
    }
  }

  protected onClose(): void {
    this.dialogRef.close(false);
  }
}
