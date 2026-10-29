import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CreateStockTransferRequest, StockTransfer } from '../models/stock-transfer.interface';
import { type PagedResult, APP_CONFIG } from '@nalunpos/shared/data-access';

@Injectable({
  providedIn: 'root',
})
export class StockTransferApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get endpoint(): string {
    return `${this.config.apiUrl}/api/stock-transfers`;
  }

  getStockTransfers(pageNumber = 1, pageSize = 20): Observable<PagedResult<StockTransfer>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<StockTransfer>>(this.endpoint, { params });
  }

  createTransfer(request: CreateStockTransferRequest): Observable<StockTransfer> {
    return this.http.post<StockTransfer>(this.endpoint, request);
  }
}
