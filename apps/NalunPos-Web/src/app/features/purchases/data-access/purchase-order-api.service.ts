import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderStatus,
  ReceivePurchaseOrderLineRequest,
} from '../models/purchase-order.interface';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get endpoint(): string {
    return `${this.config.apiUrl}/api/v1/purchase-orders`;
  }

  getPurchaseOrders(
    pageNumber = 1,
    pageSize = 20,
    status?: PurchaseOrderStatus,
  ): Observable<PurchaseOrder[]> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined && status !== null) {
      params = params.set('status', status.toString());
    }

    return this.http.get<PurchaseOrder[]>(this.endpoint, { params });
  }

  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.endpoint, request);
  }

  sendPurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.endpoint}/${id}/send`, {});
  }

  receivePurchaseOrder(
    id: string,
    lines: ReceivePurchaseOrderLineRequest[],
  ): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.endpoint}/${id}/receive`, lines);
  }
}
