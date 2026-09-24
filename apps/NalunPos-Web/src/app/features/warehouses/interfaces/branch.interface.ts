export interface Branch {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isMain: boolean;
  isActive: boolean;
}
