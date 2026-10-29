import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import type {
  CreateStockAdjustmentRequest,
  StockAdjustment,
} from '../models/stock-adjustment.interface';

@Injectable({
  providedIn: 'root',
})
export class StockAdjustmentApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get endpoint(): string {
    return `${this.config.apiUrl}/api/stock-adjustments`;
  }

  createAdjustment(request: CreateStockAdjustmentRequest): Observable<StockAdjustment> {
    return this.http.post<StockAdjustment>(this.endpoint, request);
  }
}
