import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  Warehouse,
} from '../models/warehouse.interface';

@Injectable({
  providedIn: 'root',
})
export class WarehouseApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get endpoint(): string {
    return `${this.config.apiUrl}/api/warehouses`;
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.endpoint);
  }

  createWarehouse(request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.endpoint, request);
  }

  // ── Firmas pendientes de activación backend ──
  updateWarehouse(id: string, request: UpdateWarehouseRequest): Observable<Warehouse> {
    return throwError(
      () =>
        new Error(`El endpoint PUT /api/warehouses/${id} aún no está disponible en el backend.`),
    );
  }

  changeWarehouseStatus(id: string, isActive: boolean): Observable<void> {
    return throwError(
      () =>
        new Error(
          `El endpoint PATCH /api/warehouses/${id}/status aún no está disponible en el backend.`,
        ),
    );
  }

  setDefaultWarehouse(id: string): Observable<void> {
    return throwError(
      () =>
        new Error(
          `El endpoint PATCH /api/warehouses/${id}/default aún no está disponible en el backend.`,
        ),
    );
  }
}
