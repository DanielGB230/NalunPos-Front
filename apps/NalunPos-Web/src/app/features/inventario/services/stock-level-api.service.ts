// =============================================================================
// StockLevelApiService — NalunPos-Web / features/inventario
// Cliente HTTP para los endpoints de warehouses/stock y warehouses/movements.
// Angular 22 — Zoneless — providedIn: 'root'
// =============================================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InventoryMovement,
  ProductStock,
  StockLevel,
} from '../interfaces/stock-level.interface';

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class StockLevelApiService {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Stock actual de todos los productos en un almacén específico.
   * Endpoint: GET /api/warehouses/{warehouseId}/stock
   */
  getStockByWarehouse(
    warehouseId: string,
    pageNumber = 1,
    pageSize = 10
  ): Observable<PagedResult<StockLevel>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<StockLevel>>(
      `${this.baseUrl}/api/warehouses/${warehouseId}/stock`,
      { params }
    );
  }

  /**
   * Kardex de movimientos de un almacén (todos los productos).
   * Endpoint: GET /api/warehouses/{warehouseId}/movements
   */
  getInventoryMovements(
    pageNumber = 1,
    pageSize = 20,
    warehouseId?: string
  ): Observable<PagedResult<InventoryMovement>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (warehouseId) {
      return this.http.get<PagedResult<InventoryMovement>>(
        `${this.baseUrl}/api/warehouses/${warehouseId}/movements`,
        { params }
      );
    }

    // Fallback: si no hay warehouseId, retornamos una lista vacía no debería ocurrir
    return this.http.get<PagedResult<InventoryMovement>>(
      `${this.baseUrl}/api/inventory/movements`,
      { params }
    );
  }

  /**
   * Stock de un producto específico.
   * Endpoint: GET /api/inventory/products/{productId}/stock
   */
  getProductStock(productId: string): Observable<ProductStock> {
    return this.http.get<ProductStock>(
      `${this.baseUrl}/api/inventory/products/${productId}/stock`
    );
  }
}
