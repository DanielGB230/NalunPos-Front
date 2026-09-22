import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderStatus,
  ReceivePurchaseOrderLineRequest,
} from '../interfaces/purchase-order.interface';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/purchase-orders`;
  }

  getPurchaseOrders(
    pageNumber = 1,
    pageSize = 20,
    status?: PurchaseOrderStatus
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
    lines: ReceivePurchaseOrderLineRequest[]
  ): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.endpoint}/${id}/receive`, lines);
  }
}
