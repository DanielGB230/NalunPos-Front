import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { APP_CONFIG, type AppConfig, type PagedResult } from '@nalunpos/shared/data-access';
import { TenantApiService } from './tenant-api.service';
import type { CreateTenantRequest, TenantDto } from '../models/tenant.model';

describe('TenantApiService', () => {
  let service: TenantApiService;
  let httpTesting: HttpTestingController;

  const mockConfig: AppConfig = {
    production: false,
    appName: 'NalunPos-Admin-Web',
    apiUrl: 'https://api.nalunpos.com',
  };

  const mockTenants: TenantDto[] = [
    {
      id: 'tenant-1',
      name: 'Empresa Alfa',
      documentNumber: '20123456789',
      status: 'Active',
      createdAtUtc: '2026-10-28T10:00:00Z',
    },
    {
      id: 'tenant-2',
      name: 'Empresa Beta',
      documentNumber: '20987654321',
      status: 'Pending',
      createdAtUtc: '2026-10-28T11:00:00Z',
    },
  ];

  const mockPagedResult: PagedResult<TenantDto> = {
    items: mockTenants,
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TenantApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(TenantApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener tenants paginados mediante GET /api/v1/platform/tenants', () => {
    let result: PagedResult<TenantDto> | undefined;
    service.getTenants(1, 10).subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne((r) =>
      r.url.startsWith('https://api.nalunpos.com/api/v1/platform/tenants'),
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockPagedResult);

    expect(result).toEqual(mockPagedResult);
    expect(result?.items.length).toBe(2);
  });

  it('debe incluir searchTerm en los parametros HTTP si se especifica', () => {
    service.getTenants(1, 10, 'Alfa').subscribe();

    const req = httpTesting.expectOne((r) =>
      r.url.startsWith('https://api.nalunpos.com/api/v1/platform/tenants'),
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('searchTerm')).toBe('Alfa');
    req.flush(mockPagedResult);
  });

  it('debe crear un nuevo tenant mediante POST /api/v1/platform/tenants', () => {
    const request: CreateTenantRequest = {
      name: 'Empresa Gamma',
      documentNumber: '20555666777',
      adminEmail: 'admin@gamma.com',
      adminPassword: 'Password123!',
    };

    let createdId: string | undefined;
    service.createTenant(request).subscribe((id) => {
      createdId = id;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/platform/tenants');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.responseType).toBe('text');
    req.flush('tenant-3');

    expect(createdId).toBe('tenant-3');
  });
});
