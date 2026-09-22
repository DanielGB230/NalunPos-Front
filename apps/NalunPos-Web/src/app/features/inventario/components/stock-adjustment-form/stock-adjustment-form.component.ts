// =============================================================================
// StockAdjustmentFormComponent — NalunPos-Web / features/inventario
// Modal: Formulario de ajuste de stock usando Signal Forms (@angular/forms/signals).
// Regla: PROHIBIDO ReactiveFormsModule / FormGroup. Solo form() de signals.
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
  max,
} from '@angular/forms/signals';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AppError } from '@nalunpos/shared/data-access';
import { NotificationService } from '@nalunpos/shared/ui';
import {
  CreateStockAdjustmentRequest,
  StockAdjustmentReason,
} from '../../interfaces/stock-adjustment.interface';
import { Warehouse } from '../../interfaces/warehouse.interface';
import { StockAdjustmentApiService } from '../../services/stock-adjustment-api.service';

export interface AdjustmentDialogData {
  warehouseId: string;
  warehouses: Warehouse[];
}

interface AdjustmentFormModel {
  warehouseId: string;
  productId: string;
  quantity: number;
  reason: number;
  notes: string;
}

@Component({
  selector: 'app-stock-adjustment-form',
  standalone: true,
  imports: [FormsModule, MatDialogModule, FormField],
  templateUrl: './stock-adjustment-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAdjustmentFormComponent {
  private readonly adjustmentApi = inject(StockAdjustmentApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<StockAdjustmentFormComponent>);
  protected readonly dialogData = inject<AdjustmentDialogData>(MAT_DIALOG_DATA);

  // ── Signal Form ──
  protected readonly formModel = signal<AdjustmentFormModel>({
    warehouseId: this.dialogData.warehouseId,
    productId: '',
    quantity: 0,
    reason: StockAdjustmentReason.CountDifference,
    notes: '',
  });

  protected readonly adjustmentForm = form(this.formModel, (fields) => {
    required(fields.warehouseId);
    required(fields.productId);
    required(fields.quantity);
    min(fields.quantity, -9999);
    max(fields.quantity, 9999);
    required(fields.reason);
  });

  protected readonly warehouseIdField = this.adjustmentForm.warehouseId;
  protected readonly productIdField = this.adjustmentForm.productId;
  protected readonly quantityField = this.adjustmentForm.quantity;
  protected readonly reasonField = this.adjustmentForm.reason;
  protected readonly notesField = this.adjustmentForm.notes;

  // ── Estado ──
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Opciones de Reason ──
  protected readonly reasonOptions = [
    { value: StockAdjustmentReason.CountDifference, label: 'Diferencia de Conteo' },
    { value: StockAdjustmentReason.Damage, label: 'Daño o Merma' },
    { value: StockAdjustmentReason.Expiration, label: 'Vencimiento' },
    { value: StockAdjustmentReason.Theft, label: 'Robo / Pérdida' },
    { value: StockAdjustmentReason.InitialLoad, label: 'Carga Inicial' },
    { value: StockAdjustmentReason.Other, label: 'Otro' },
  ];

  protected close(saved = false): void {
    this.dialogRef.close(saved);
  }

  protected onReasonChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.formModel.update((m) => ({ ...m, reason: value }));
  }

  protected async onSubmit(): Promise<void> {
    const model = this.formModel();

    if (!model.warehouseId || !model.productId || model.quantity === 0) {
      this.notification.warning(
        'Complete todos los campos obligatorios. La cantidad no puede ser cero.',
        'Datos incompletos'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request: CreateStockAdjustmentRequest = {
      warehouseId: model.warehouseId,
      reason: model.reason,
      lines: [{ productId: model.productId, quantity: model.quantity }],
      notes: model.notes || undefined,
    };

    this.adjustmentApi.createAdjustment(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notification.success(
          `Ajuste de inventario registrado correctamente (${model.quantity > 0 ? '+' : ''}${model.quantity} unidades).`,
          'Ajuste Exitoso'
        );
        this.close(true);
      },
      error: (error: AppError) => {
        this.isLoading.set(false);
        const msg = error?.message ?? 'Error al registrar el ajuste. Intente nuevamente.';
        this.errorMessage.set(msg);
        this.notification.error(msg, 'Error de Ajuste');
      },
    });
  }
}
