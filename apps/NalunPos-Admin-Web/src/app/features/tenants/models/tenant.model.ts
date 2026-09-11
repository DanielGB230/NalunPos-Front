export interface TenantDto {
  id: string;
  name: string;
  documentNumber: string;
  status: string;
  createdAtUtc: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateTenantRequest {
  name: string;
  documentNumber: string;
  adminEmail: string;
  adminPassword: string;
}
