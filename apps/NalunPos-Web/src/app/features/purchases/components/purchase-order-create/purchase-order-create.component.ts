import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AppNumberPipe } from '@nalunpos/shared/util';
import { NotificationService } from '@nalunpos/shared/ui';
import {
  type Supplier,
  SupplierApiService,
  type Warehouse,
  WarehouseApiService,
} from '@nalunpos/shared/data-access';
import type { CreatePurchaseOrderRequest } from '../../models/purchase-order.interface';
import { PurchaseOrderApiService } from '../../data-access/purchase-order-api.service';

export interface PurchaseOrderLineModel {
  productId: string;
  quantityOrdered: number;
  unitCostAmount: number;
  currency: string;
}

@Component({
  selector: 'app-purchase-order-create',
  standalone: true,
  imports: [AppNumberPipe, MatDialogModule],
  templateUrl: './purchase-order-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderCreateComponent implements OnInit {
  private readonly supplierApi = inject(SupplierApiService);
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly purchaseOrderApi = inject(PurchaseOrderApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<PurchaseOrderCreateComponent>);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly warehouses = signal<Warehouse[]>([]);
  protected readonly isSaving = signal(false);

  // ── Signals de Estado de Formulario (Zero ReactiveFormsModule) ──
  protected readonly supplierId = signal<string>('');
  protected readonly warehouseId = signal<string>('');
  protected readonly notes = signal<string>('');
  protected readonly lines = signal<PurchaseOrderLineModel[]>([]);

  // ── Total Computado ──
  protected readonly totalAmount = computed(() =>
    this.lines().reduce(
      (acc, l) => acc + (Number(l.quantityOrdered) || 0) * (Number(l.unitCostAmount) || 0),
      0,
    ),
  );

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadWarehouses();
    this.addLine();
  }

  private loadSuppliers(): void {
    this.supplierApi.getSuppliers(1, 100, undefined, true).subscribe({
      next: (res) => this.suppliers.set(res.items),
      error: () => this.notification.error('No se pudieron cargar los proveedores.', 'Error'),
    });
  }

  private loadWarehouses(): void {
    this.warehouseApi.getWarehouses().subscribe({
      next: (whs) => {
        this.warehouses.set(whs);
        const def = whs.find((w) => w.isDefault) ?? whs[0];
        if (def) this.warehouseId.set(def.id);
      },
      error: () => this.notification.error('No se pudieron cargar los almacenes.', 'Error'),
    });
  }

  protected addLine(): void {
    this.lines.update((items) => [
      ...items,
      { productId: '', quantityOrdered: 1, unitCostAmount: 0, currency: 'USD' },
    ]);
  }

  protected removeLine(index: number): void {
    if (this.lines().length > 1) {
      this.lines.update((items) => items.filter((_, i) => i !== index));
    }
  }

  protected updateLineField<K extends keyof PurchaseOrderLineModel>(
    index: number,
    field: K,
    value: PurchaseOrderLineModel[K],
  ): void {
    this.lines.update((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  protected onSupplierChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.supplierId.set(target.value);
  }

  protected onWarehouseChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.warehouseId.set(target.value);
  }

  protected onNotesInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.notes.set(target.value);
  }

  protected onLineProductInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateLineField(index, 'productId', target.value);
  }

  protected onLineQtyInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateLineField(index, 'quantityOrdered', +target.value);
  }

  protected onLineCostInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateLineField(index, 'unitCostAmount', +target.value);
  }

  protected onLineCurrencyChange(index: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateLineField(index, 'currency', target.value);
  }

  protected onSubmit(): void {
    if (!this.supplierId() || !this.warehouseId() || this.lines().length === 0) {
      this.notification.warning(
        'Por favor seleccione proveedor y almacén destino.',
        'Formulario Incompleto',
      );
      return;
    }

    for (const l of this.lines()) {
      if (!l.productId.trim() || l.quantityOrdered <= 0 || l.unitCostAmount < 0) {
        this.notification.warning(
          'Verifique las líneas: se requiere producto, cantidad > 0 y costo válido.',
          'Líneas Inválidas',
        );
        return;
      }
    }

    this.isSaving.set(true);

    const request: CreatePurchaseOrderRequest = {
      supplierId: this.supplierId(),
      warehouseId: this.warehouseId(),
      notes: this.notes() || undefined,
      lines: this.lines().map((l) => ({
        productId: l.productId,
        quantityOrdered: Number(l.quantityOrdered),
        unitCostAmount: Number(l.unitCostAmount),
        currency: l.currency || 'USD',
      })),
    };

    this.purchaseOrderApi.createPurchaseOrder(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notification.success('Orden de Compra creada en borrador.', 'Éxito');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notification.error(
          err?.error?.detail || 'No se pudo crear la orden de compra.',
          'Error',
        );
      },
    });
  }

  protected onClose(): void {
    this.dialogRef.close(false);
  }
}
