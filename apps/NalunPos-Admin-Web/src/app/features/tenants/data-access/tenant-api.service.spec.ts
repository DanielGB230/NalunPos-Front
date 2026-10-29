import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { APP_CONFIG, type AppConfig, type PagedResult } from '@nalunpos/shared/data-access';
import { TenantApiService } from './tenant-api.service';
import type { CreateTenantRequest, TenantDto } from '../models/tenant.model';

describe('TenantApiService', () => {
  let service: TenantApiService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

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
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TenantApiService,
        { provide: HttpClient, useValue: httpMock },
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(TenantApiService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener tenants paginados mediante GET /api/v1/platform/tenants', () => {
    httpMock.get.mockReturnValue(of(mockPagedResult));

    let result: PagedResult<TenantDto> | undefined;
    service.getTenants(1, 10).subscribe((data) => {
      result = data;
    });

    expect(httpMock.get).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/platform/tenants',
      expect.objectContaining({
        params: expect.anything(),
      }),
    );
    expect(result).toEqual(mockPagedResult);
    expect(result?.items.length).toBe(2);
  });

  it('debe incluir searchTerm en los parametros HTTP si se especifica', () => {
    httpMock.get.mockReturnValue(of(mockPagedResult));

    service.getTenants(1, 10, 'Alfa').subscribe();

    expect(httpMock.get).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/platform/tenants',
      expect.objectContaining({
        params: expect.anything(),
      }),
    );
  });

  it('debe crear un nuevo tenant mediante POST /api/v1/platform/tenants', () => {
    const request: CreateTenantRequest = {
      name: 'Empresa Gamma',
      documentNumber: '20555666777',
      adminEmail: 'admin@gamma.com',
      adminPassword: 'Password123!',
    };

    httpMock.post.mockReturnValue(of('tenant-3'));

    let createdId: string | undefined;
    service.createTenant(request).subscribe((id) => {
      createdId = id;
    });

    expect(httpMock.post).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/platform/tenants',
      request,
      { responseType: 'text' },
    );
    expect(createdId).toBe('tenant-3');
  });
});
