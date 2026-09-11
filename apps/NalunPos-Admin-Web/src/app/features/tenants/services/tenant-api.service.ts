import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateTenantRequest, PagedResult, TenantDto } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/v1/platform/tenants`;
  }

  getTenants(pageNumber = 1, pageSize = 10, searchTerm?: string): Observable<PagedResult<TenantDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim().length > 0) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<PagedResult<TenantDto>>(this.endpoint, { params });
  }

  createTenant(request: CreateTenantRequest): Observable<string> {
    return this.http.post<string>(this.endpoint, request);
  }
}
