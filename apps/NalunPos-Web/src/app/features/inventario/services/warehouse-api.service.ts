import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateWarehouseRequest, Warehouse } from '../interfaces/warehouse.interface';

@Injectable({
  providedIn: 'root',
})
export class WarehouseApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/warehouses`;
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.endpoint);
  }

  createWarehouse(request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.endpoint, request);
  }
}
