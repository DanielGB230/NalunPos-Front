export interface StockLevel {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  containerId?: string | null;
  quantityAvailable: number;
  quantityReserved: number;
  minStockThreshold: number;
  totalPhysical: number;
  isBelowMinThreshold: boolean;
}

export interface ProductStock {
  productId: string;
  productName: string;
  sku: string;
  currentStockCalculated: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  movementType: number;
  movementTypeName: string;
  referenceId?: string | null;
  notes?: string | null;
  createdAtUtc: string;
}
