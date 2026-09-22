export interface Warehouse {
  id: string;
  branchId: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateWarehouseRequest {
  branchId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}
