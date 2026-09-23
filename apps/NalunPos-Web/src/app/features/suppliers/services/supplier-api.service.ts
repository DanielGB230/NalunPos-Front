import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateSupplierRequest,
  Supplier,
  UpdateSupplierRequest,
} from '../interfaces/supplier.interface';
import { PagedResult } from '../../inventario/services/stock-level-api.service';

@Injectable({
  providedIn: 'root',
})
export class SupplierApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/suppliers`;
  }

  getSuppliers(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    isActiveOnly?: boolean
  ): Observable<PagedResult<Supplier>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim().length > 0) {
      params = params.set('searchTerm', searchTerm.trim());
    }
    if (isActiveOnly !== undefined && isActiveOnly !== null) {
      params = params.set('isActiveOnly', isActiveOnly.toString());
    }

    return this.http.get<PagedResult<Supplier>>(this.endpoint, { params });
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.endpoint}/${id}`);
  }

  createSupplier(request: CreateSupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(this.endpoint, request);
  }

  updateSupplier(id: string, request: UpdateSupplierRequest): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.endpoint}/${id}`, request);
  }

  changeSupplierStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.endpoint}/${id}/status`, { isActive });
  }
}
