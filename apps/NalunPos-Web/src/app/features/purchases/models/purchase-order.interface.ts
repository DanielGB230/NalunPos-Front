export enum PurchaseOrderStatus {
  Draft = 0,
  Sent = 1,
  PartiallyReceived = 2,
  FullyReceived = 3,
  Cancelled = 4,
}

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityPending: number;
  isFullyReceived: boolean;
  unitCostAmount: number;
  currency: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  warehouseId: string;
  orderNumber: string;
  notes?: string | null;
  status: PurchaseOrderStatus;
  statusName: string;
  totalOrderedCostAmount: number;
  currency: string;
  lines: PurchaseOrderLine[];
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export type PurchaseOrderDto = PurchaseOrder;

export interface CreatePurchaseOrderLineRequest {
  productId: string;
  quantityOrdered: number;
  unitCostAmount: number;
  currency?: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  warehouseId: string;
  lines: CreatePurchaseOrderLineRequest[];
  notes?: string;
}

export interface ReceivePurchaseOrderLineRequest {
  productId: string;
  receivedQuantity: number;
  batchNumber?: string;
  expirationDate?: string;
}
