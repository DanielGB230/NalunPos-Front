export interface StockTransferLine {
  productId: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  notes?: string | null;
  lines: StockTransferLine[];
  createdAtUtc: string;
}

export interface CreateStockTransferRequest {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  lines: { productId: string; quantity: number }[];
  notes?: string;
}
