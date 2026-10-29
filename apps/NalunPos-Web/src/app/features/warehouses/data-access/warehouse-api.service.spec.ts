import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WarehouseApiService } from './warehouse-api.service';
import { APP_CONFIG, type AppConfig } from '@nalunpos/shared/data-access';
import type { Warehouse, CreateWarehouseRequest } from '../models/warehouse.interface';

describe('WarehouseApiService', () => {
  let service: WarehouseApiService;
  let httpTesting: HttpTestingController;

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
    TestBed.configureTestingModule({
      providers: [
        WarehouseApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(WarehouseApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe obtener la lista de almacenes mediante GET /api/v1/warehouses', () => {
    let result: Warehouse[] | undefined;
    service.getWarehouses().subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/warehouses');
    expect(req.request.method).toBe('GET');
    req.flush([mockWarehouse]);

    expect(result).toEqual([mockWarehouse]);
  });

  it('debe registrar un almacen nuevo mediante POST /api/v1/warehouses', () => {
    const request: CreateWarehouseRequest = {
      name: 'Bodega Norte',
      description: 'Zona Industrial',
      branchId: 'br-002',
    };

    let created: Warehouse | undefined;
    service.createWarehouse(request).subscribe((data) => {
      created = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/warehouses');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockWarehouse);

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

    let statusError = '';
    service.changeWarehouseStatus('wh-123', false).subscribe({
      error: (err: Error) => {
        statusError = err.message;
      },
    });
    expect(statusError).toContain('disponible en el backend');

    let defaultError = '';
    service.setDefaultWarehouse('wh-123').subscribe({
      error: (err: Error) => {
        defaultError = err.message;
      },
    });
    expect(defaultError).toContain('disponible en el backend');
  });
});
