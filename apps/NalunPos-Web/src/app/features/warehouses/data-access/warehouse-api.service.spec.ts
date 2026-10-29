import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { WarehouseApiService } from './warehouse-api.service';
import { APP_CONFIG, type AppConfig } from '@nalunpos/shared/data-access';
import type { Warehouse, CreateWarehouseRequest } from '../models/warehouse.interface';

describe('WarehouseApiService', () => {
  let service: WarehouseApiService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  const mockConfig: AppConfig = {
    apiUrl: 'https://api.nalunpos.com',
    appName: 'NalunPos Test',
    production: false,
  };

  const mockWarehouse: Warehouse = {
    id: 'wh-123',
    tenantId: 'tenant-1',
    name: 'Almacen Central',
    description: 'Sede Principal',
    branchId: 'br-001',
    isDefault: true,
    isActive: true,
    createdAtUtc: '2026-10-28T12:00:00Z',
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        WarehouseApiService,
        { provide: HttpClient, useValue: httpMock },
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(WarehouseApiService);
  });

  it('debe obtener la lista de almacenes mediante GET /api/v1/warehouses', () => {
    httpMock.get.mockReturnValue(of([mockWarehouse]));

    let result: Warehouse[] | undefined;
    service.getWarehouses().subscribe((data) => {
      result = data;
    });

    expect(httpMock.get).toHaveBeenCalledWith('https://api.nalunpos.com/api/v1/warehouses');
    expect(result).toEqual([mockWarehouse]);
  });

  it('debe registrar un almacen nuevo mediante POST /api/v1/warehouses', () => {
    const request: CreateWarehouseRequest = {
      name: 'Bodega Norte',
      description: 'Zona Industrial',
      branchId: 'br-002',
    };

    httpMock.post.mockReturnValue(of(mockWarehouse));

    let created: Warehouse | undefined;
    service.createWarehouse(request).subscribe((data) => {
      created = data;
    });

    expect(httpMock.post).toHaveBeenCalledWith(
      'https://api.nalunpos.com/api/v1/warehouses',
      request,
    );
    expect(created).toEqual(mockWarehouse);
  });

  it('debe retornar error observable para endpoints aun pendientes en backend', () => {
    let errorMsg = '';
    service.updateWarehouse('wh-123', { id: 'wh-123', name: 'New Name' }).subscribe({
      error: (err: Error) => {
        errorMsg = err.message;
      },
    });

    expect(errorMsg).toContain('disponible en el backend');
  });
});
