export interface TenantDto {
  id: string;
  name: string;
  documentNumber: string;
  status: string;
  createdAtUtc: string;
}

export interface CreateTenantRequest {
  name: string;
  documentNumber: string;
  adminEmail: string;
  adminPassword: string;
}
