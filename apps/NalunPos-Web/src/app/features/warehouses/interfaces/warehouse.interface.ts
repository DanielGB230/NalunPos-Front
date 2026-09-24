export interface Warehouse {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface CreateWarehouseRequest {
  branchId: string;
  name: string;
  description?: string | null;
  isDefault?: boolean;
}

export interface UpdateWarehouseRequest {
  id: string;
  name: string;
  description?: string | null;
}
