import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Branch } from '../interfaces/branch.interface';

@Injectable({
  providedIn: 'root',
})
export class BranchApiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `${environment.apiUrl}/api/branches`;
  }

  getBranches(isActive: boolean = true): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.endpoint, {
      params: { isActive: isActive.toString() },
    });
  }
}
