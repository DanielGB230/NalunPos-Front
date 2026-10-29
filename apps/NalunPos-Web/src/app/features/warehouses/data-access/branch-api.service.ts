import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import type { Branch } from '../models/branch.interface';

import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BranchApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get endpoint(): string {
    return `${this.config.apiUrl}/api/Branches`;
  }

  getBranches(isActive?: boolean): Observable<Branch[]> {
    let params = new HttpParams();

    if (isActive !== undefined && isActive !== null) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<Branch[]>(this.endpoint, { params });
  }
}
