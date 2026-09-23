export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}
