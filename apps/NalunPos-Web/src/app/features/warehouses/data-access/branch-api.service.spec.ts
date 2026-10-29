import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BranchApiService } from './branch-api.service';
import { APP_CONFIG, type AppConfig } from '@nalunpos/shared/data-access';
import type { Branch } from '../models/branch.interface';

describe('BranchApiService', () => {
  let service: BranchApiService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
  };

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
    httpMock = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        BranchApiService,
        { provide: HttpClient, useValue: httpMock },
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(BranchApiService);
  });

  it('debe solicitar sucursales sin parametros si no se especifica isActive', () => {
    httpMock.get.mockReturnValue(of(mockBranches));

    let result: Branch[] | undefined;
    service.getBranches().subscribe((data) => {
      result = data;
    });

    expect(httpMock.get).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/branches',
      expect.anything(),
    );
    expect(result).toEqual(mockBranches);
  });

  it('debe incluir parametro isActive si se especifica', () => {
    httpMock.get.mockReturnValue(of(mockBranches));

    service.getBranches(true).subscribe();

    expect(httpMock.get).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/branches',
      expect.objectContaining({
        params: expect.anything(),
      }),
    );
  });
});
