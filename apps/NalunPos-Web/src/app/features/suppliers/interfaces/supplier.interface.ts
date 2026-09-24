export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  taxCountryCode: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export type SupplierDto = Supplier;

export interface CreateSupplierRequest {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  taxCountryCode: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  id: string;
  isActive?: boolean;
}
