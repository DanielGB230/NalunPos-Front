import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest, PagedResult } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/v1/categories`;
  }

  getCategories(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    isActiveOnly?: boolean
  ): Observable<PagedResult<CategoryDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim().length > 0) {
      params = params.set('searchTerm', searchTerm.trim());
    }
    if (isActiveOnly !== undefined && isActiveOnly !== null) {
      params = params.set('isActiveOnly', isActiveOnly.toString());
    }

    return this.http.get<PagedResult<CategoryDto>>(this.endpoint, { params });
  }

  getCategoryById(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.endpoint}/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.endpoint, request);
  }

  updateCategory(id: string, request: UpdateCategoryRequest): Observable<CategoryDto> {
    return this.http.patch<CategoryDto>(`${this.endpoint}/${id}`, request);
  }

  changeCategoryStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.endpoint}/${id}/status`, { isActive });
  }
}
