export enum StockAdjustmentReason {
  CountDifference = 0,
  Damage = 1,
  Expiration = 2,
  Theft = 3,
  InitialLoad = 4,
  Other = 5
}

export interface StockAdjustmentLine {
  productId: string;
  quantity: number;
}

export interface StockAdjustment {
  id: string;
  warehouseId: string;
  reason: StockAdjustmentReason;
  reasonName: string;
  notes?: string | null;
  lines: StockAdjustmentLine[];
  createdAtUtc: string;
}

export interface CreateStockAdjustmentRequest {
  warehouseId: string;
  reason: StockAdjustmentReason;
  lines: { productId: string; quantity: number }[];
  notes?: string;
}
