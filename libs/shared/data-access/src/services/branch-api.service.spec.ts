import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BranchApiService } from './branch-api.service';
import { APP_CONFIG } from '../config/app-config.token';
import type { AppConfig } from '../config/app-config.interface';
import type { Branch } from '../models/branch.model';

describe('BranchApiService', () => {
  let service: BranchApiService;
  let httpTesting: HttpTestingController;

  const mockConfig: AppConfig = {
    apiUrl: 'https://api.nalunpos.com',
    appName: 'NalunPos Test',
    production: false,
  };

  const mockBranches: Branch[] = [
    {
      id: 'br-1',
      tenantId: 'tenant-1',
      code: 'SUC-01',
      name: 'Sucursal Centro',
      address: 'Av. Principal 123',
      phone: '555-0100',
      isMain: true,
      isActive: true,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BranchApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(BranchApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe solicitar sucursales sin parametros si no se especifica isActive', () => {
    let result: Branch[] | undefined;
    service.getBranches().subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/branches');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('isActive')).toBe(false);
    req.flush(mockBranches);

    expect(result).toEqual(mockBranches);
  });

  it('debe incluir parametro isActive si se especifica', () => {
    let result: Branch[] | undefined;
    service.getBranches(true).subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/branches?isActive=true');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('isActive')).toBe('true');
    req.flush(mockBranches);

    expect(result).toEqual(mockBranches);
  });
});
