export interface CategoryDto {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}
