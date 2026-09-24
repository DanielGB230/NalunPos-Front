import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@nalunpos/shared/ui';
import { Warehouse, CreateWarehouseRequest } from '../../interfaces/warehouse.interface';
import { Branch } from '../../interfaces/branch.interface';
import { WarehouseApiService } from '../../services/warehouse-api.service';
import { BranchApiService } from '../../services/branch-api.service';

export interface WarehouseDialogData {
  warehouse?: Warehouse;
}

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './warehouse-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseFormComponent implements OnInit {
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly branchApi = inject(BranchApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<WarehouseFormComponent>);
  public readonly data = inject<WarehouseDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly isSaving = signal(false);
  protected readonly isLoadingBranches = signal(false);
  protected readonly branches = signal<Branch[]>([]);

  // ── Signals de Estado Formulario (Zero ReactiveFormsModule) ──
  protected readonly name = signal(this.data?.warehouse?.name ?? '');
  protected readonly description = signal(this.data?.warehouse?.description ?? '');
  protected readonly branchId = signal(this.data?.warehouse?.branchId ?? '');
  protected readonly isDefault = signal(this.data?.warehouse?.isDefault ?? false);

  ngOnInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.isLoadingBranches.set(true);
    this.branchApi.getBranches(true).subscribe({
      next: (data) => {
        this.branches.set(data);
        this.isLoadingBranches.set(false);
        // Si no hay branchId seleccionado y hay sucursales, autoseleccionar la primera o la principal
        if (!this.branchId() && data.length > 0) {
          const mainBranch = data.find((b) => b.isMain) ?? data[0];
          this.branchId.set(mainBranch.id);
        }
      },
      error: () => {
        this.isLoadingBranches.set(false);
        this.notification.error('No se pudieron cargar las sucursales activas.', 'Error');
      },
    });
  }

  protected onSubmit(): void {
    if (this.isSaving()) return;

    if (!this.name().trim()) {
      this.notification.warning('Por favor ingrese un nombre de almacén válido.', 'Formulario Incompleto');
      return;
    }

    if (this.name().trim().length < 2) {
      this.notification.warning('El nombre del almacén debe tener al menos 2 caracteres.', 'Nombre Inválido');
      return;
    }

    if (!this.branchId()) {
      this.notification.warning('Por favor seleccione una sucursal para el almacén.', 'Formulario Incompleto');
      return;
    }

    this.isSaving.set(true);

    const createReq: CreateWarehouseRequest = {
      branchId: this.branchId(),
      name: this.name().trim(),
      description: this.description().trim() || null,
      isDefault: this.isDefault(),
    };

    this.warehouseApi.createWarehouse(createReq).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notification.success(`El almacén "${createReq.name}" fue creado exitosamente.`, 'Éxito');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        const detail = err?.error?.detail || err?.error?.message || 'Error al conectar con el servidor.';
        this.notification.error(detail, 'Error de creación');
      },
    });
  }

  protected onClose(): void {
    this.dialogRef.close(false);
  }
}
