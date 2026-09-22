import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateStockAdjustmentRequest,
  StockAdjustment,
} from '../interfaces/stock-adjustment.interface';

@Injectable({
  providedIn: 'root',
})
export class StockAdjustmentApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/stock-adjustments`;
  }

  createAdjustment(request: CreateStockAdjustmentRequest): Observable<StockAdjustment> {
    return this.http.post<StockAdjustment>(this.endpoint, request);
  }
}
