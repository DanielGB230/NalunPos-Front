// =============================================================================
// StockTransferFormComponent — NalunPos-Web / features/inventario
// Modal: Formulario de traspaso entre almacenes usando Signal Forms.
// Solo visible si warehouses.length > 1 (condicional en Shell).
// Angular 22 — Zoneless — Standalone — Tailwind v4 only
// =============================================================================

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
  required,
  min,
} from '@angular/forms/signals';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AppError } from '@nalunpos/shared/data-access';
import { NotificationService } from '@nalunpos/shared/ui';
import { CreateStockTransferRequest } from '../../interfaces/stock-transfer.interface';
import { Warehouse } from '../../interfaces/warehouse.interface';
import { StockTransferApiService } from '../../services/stock-transfer-api.service';

export interface TransferDialogData {
  warehouses: Warehouse[];
}

interface TransferFormModel {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  productId: string;
  quantity: number;
  notes: string;
}

@Component({
  selector: 'app-stock-transfer-form',
  standalone: true,
  imports: [FormsModule, MatDialogModule, FormField],
  templateUrl: './stock-transfer-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockTransferFormComponent {
  private readonly transferApi = inject(StockTransferApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<StockTransferFormComponent>);
  protected readonly dialogData = inject<TransferDialogData>(MAT_DIALOG_DATA);

  // ── Signal Form ──
  private readonly formModel = signal<TransferFormModel>({
    sourceWarehouseId: this.dialogData.warehouses[0]?.id ?? '',
    destinationWarehouseId: this.dialogData.warehouses[1]?.id ?? '',
    productId: '',
    quantity: 1,
    notes: '',
  });

  protected readonly transferForm = form(this.formModel, (fields) => {
    required(fields.sourceWarehouseId);
    required(fields.destinationWarehouseId);
    required(fields.productId);
    required(fields.quantity);
    min(fields.quantity, 1);
  });

  protected readonly sourceWarehouseField = this.transferForm.sourceWarehouseId;
  protected readonly destinationWarehouseField = this.transferForm.destinationWarehouseId;
  protected readonly productIdField = this.transferForm.productId;
  protected readonly quantityField = this.transferForm.quantity;
  protected readonly notesField = this.transferForm.notes;

  // ── Estado ──
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected close(saved = false): void {
    this.dialogRef.close(saved);
  }

  protected async onSubmit(): Promise<void> {
    const model = this.formModel();

    if (!model.sourceWarehouseId || !model.destinationWarehouseId || !model.productId || model.quantity < 1) {
      this.notification.warning(
        'Complete todos los campos. La cantidad debe ser mayor a 0.',
        'Datos incompletos'
      );
      return;
    }

    if (model.sourceWarehouseId === model.destinationWarehouseId) {
      this.notification.warning(
        'El almacén de origen y destino no pueden ser el mismo.',
        'Selección inválida'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request: CreateStockTransferRequest = {
      sourceWarehouseId: model.sourceWarehouseId,
      destinationWarehouseId: model.destinationWarehouseId,
      lines: [{ productId: model.productId, quantity: model.quantity }],
      notes: model.notes || undefined,
    };

    this.transferApi.createTransfer(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notification.success(
          `Traspaso de ${model.quantity} unidades registrado correctamente.`,
          'Traspaso Exitoso'
        );
        this.close(true);
      },
      error: (error: AppError) => {
        this.isLoading.set(false);
        const msg = error?.message ?? 'Error al registrar el traspaso. Intente nuevamente.';
        this.errorMessage.set(msg);
        this.notification.error(msg, 'Error de Traspaso');
      },
    });
  }
}
