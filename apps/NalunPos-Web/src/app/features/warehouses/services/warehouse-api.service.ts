import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateWarehouseRequest, UpdateWarehouseRequest, Warehouse } from '../interfaces/warehouse.interface';

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

  // ── Firmas pendientes de activación backend ──
  updateWarehouse(id: string, request: UpdateWarehouseRequest): Observable<Warehouse> {
    return throwError(() => new Error(`El endpoint PUT /api/warehouses/${id} aún no está disponible en el backend.`));
  }

  changeWarehouseStatus(id: string, isActive: boolean): Observable<void> {
    return throwError(() => new Error(`El endpoint PATCH /api/warehouses/${id}/status aún no está disponible en el backend.`));
  }

  setDefaultWarehouse(id: string): Observable<void> {
    return throwError(() => new Error(`El endpoint PATCH /api/warehouses/${id}/default aún no está disponible en el backend.`));
  }
}
