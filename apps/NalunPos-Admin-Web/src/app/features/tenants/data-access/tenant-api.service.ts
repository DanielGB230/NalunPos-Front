import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { APP_CONFIG, type PagedResult } from '@nalunpos/shared/data-access';
import type { CreateTenantRequest, TenantDto } from '../models/tenant.model';

@Injectable({
  providedIn: 'root',
})
export class TenantApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get endpoint(): string {
    return `${this.config.apiUrl}/api/v1/platform/tenants`;
  }

  getTenants(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
  ): Observable<PagedResult<TenantDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim().length > 0) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<PagedResult<TenantDto>>(this.endpoint, { params });
  }

  createTenant(request: CreateTenantRequest): Observable<string> {
    return this.http.post(this.endpoint, request, { responseType: 'text' });
  }
}
