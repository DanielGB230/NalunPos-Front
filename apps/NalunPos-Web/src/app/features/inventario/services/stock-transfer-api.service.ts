import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateStockTransferRequest,
  StockTransfer,
} from '../interfaces/stock-transfer.interface';
import { PagedResult } from './stock-level-api.service';

@Injectable({
  providedIn: 'root',
})
export class StockTransferApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/stock-transfers`;
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
