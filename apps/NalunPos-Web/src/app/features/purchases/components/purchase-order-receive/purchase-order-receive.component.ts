import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '@nalunpos/shared/ui';
import { PurchaseOrder, ReceivePurchaseOrderLineRequest } from '../../interfaces/purchase-order.interface';
import { PurchaseOrderApiService } from '../../services/purchase-order-api.service';

export interface ReceiveOrderDialogData {
  order: PurchaseOrder;
}

export interface ReceiveLineModel {
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityPending: number;
  receivedQuantity: number;
  batchNumber: string;
  expirationDate: string;
}

@Component({
  selector: 'app-purchase-order-receive',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './purchase-order-receive.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderReceiveComponent implements OnInit {
  private readonly purchaseOrderApi = inject(PurchaseOrderApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<PurchaseOrderReceiveComponent>);
  public readonly data = inject<ReceiveOrderDialogData>(MAT_DIALOG_DATA);

  protected readonly isSaving = signal(false);

  // ── Signals de Estado Formulario (Zero ReactiveFormsModule) ──
  protected readonly lines = signal<ReceiveLineModel[]>([]);

  ngOnInit(): void {
    this.initLines();
  }

  private initLines(): void {
    if (!this.data?.order?.lines) return;

    const pendingLines: ReceiveLineModel[] = [];
    for (const line of this.data.order.lines) {
      if (line.quantityPending > 0) {
        pendingLines.push({
          productId: line.productId,
          quantityOrdered: line.quantityOrdered,
          quantityReceived: line.quantityReceived,
          quantityPending: line.quantityPending,
          receivedQuantity: line.quantityPending,
          batchNumber: '',
          expirationDate: '',
        });
      }
    }
    this.lines.set(pendingLines);
  }

  protected updateLineField<K extends keyof ReceiveLineModel>(
    index: number,
    field: K,
    value: ReceiveLineModel[K]
  ): void {
    this.lines.update((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  protected onSubmit(): void {
    if (this.lines().length === 0) return;

    for (const line of this.lines()) {
      if (line.receivedQuantity <= 0 || line.receivedQuantity > line.quantityPending) {
        this.notification.warning(
          `La cantidad a recibir para el producto ${line.productId} debe ser mayor a 0 y no exceder los ${line.quantityPending} pendientes.`,
          'Cantidad Inválida'
        );
        return;
      }
    }

    this.isSaving.set(true);

    const receiveLines: ReceivePurchaseOrderLineRequest[] = this.lines().map((l) => ({
      productId: l.productId,
      receivedQuantity: Number(l.receivedQuantity),
      batchNumber: l.batchNumber || undefined,
      expirationDate: l.expirationDate || undefined,
    }));

    this.purchaseOrderApi.receivePurchaseOrder(this.data.order.id, receiveLines).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notification.success('Recepción de productos registrada con éxito.', 'Recepción Exitosa');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notification.error(err?.error?.detail || 'No se pudo registrar la recepción.', 'Error');
      },
    });
  }

  protected onClose(): void {
    this.dialogRef.close(false);
  }
}
