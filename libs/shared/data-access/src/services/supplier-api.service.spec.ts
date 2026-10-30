import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SupplierApiService } from './supplier-api.service';
import { APP_CONFIG } from '../config/app-config.token';
import type { AppConfig } from '../config/app-config.interface';
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '../models/supplier.model';
import type { PagedResult } from '../interfaces/paged-result.interface';

describe('SupplierApiService', () => {
  let service: SupplierApiService;
  let httpTesting: HttpTestingController;

  const mockConfig: AppConfig = {
    apiUrl: 'https://api.nalunpos.com',
    appName: 'NalunPos Test',
    production: false,
  };

  const mockSupplier: Supplier = {
    id: 'sup-1',
    name: 'Distribuidora Global',
    contactName: 'Carlos Lopez',
    email: 'contacto@distribuidora.com',
    phone: '555-1234',
    taxId: '20123456789',
    taxCountryCode: 'PE',
    street: 'Av. Industrial 456',
    city: 'Lima',
    zipCode: '15001',
    country: 'Perú',
    isActive: true,
    createdAtUtc: '2026-10-28T12:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SupplierApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(SupplierApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe obtener proveedores paginados con parametros opcionales', () => {
    const mockPagedResult: PagedResult<Supplier> = {
      items: [mockSupplier],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    let result: PagedResult<Supplier> | undefined;
    service.getSuppliers(1, 10, 'global', true).subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne(
      'https://api.nalunpos.com/api/v1/suppliers?pageNumber=1&pageSize=10&searchTerm=global&isActive=true',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedResult);

    expect(result).toEqual(mockPagedResult);
  });

  it('debe obtener un proveedor por ID', () => {
    let result: Supplier | undefined;
    service.getSupplierById('sup-1').subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/suppliers/sup-1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSupplier);

    expect(result).toEqual(mockSupplier);
  });

  it('debe registrar un proveedor mediante POST', () => {
    const request: CreateSupplierRequest = {
      name: 'Distribuidora Global',
      contactName: 'Carlos Lopez',
      email: 'contacto@distribuidora.com',
      phone: '555-1234',
      taxId: '20123456789',
      taxCountryCode: 'PE',
      street: 'Av. Industrial 456',
      city: 'Lima',
      zipCode: '15001',
      country: 'Perú',
    };

    let created: Supplier | undefined;
    service.createSupplier(request).subscribe((data) => {
      created = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/suppliers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockSupplier);

    expect(created).toEqual(mockSupplier);
  });

  it('debe actualizar un proveedor mediante PATCH', () => {
    const request: UpdateSupplierRequest = {
      id: 'sup-1',
      name: 'Distribuidora Actualizada',
      contactName: 'Carlos Lopez',
      email: 'contacto@distribuidora.com',
      phone: '555-1234',
      taxId: '20123456789',
      taxCountryCode: 'PE',
      street: 'Av. Industrial 456',
      city: 'Lima',
      zipCode: '15001',
      country: 'Perú',
    };

    let updated: Supplier | undefined;
    service.updateSupplier('sup-1', request).subscribe((data) => {
      updated = data;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/suppliers/sup-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockSupplier, name: 'Distribuidora Actualizada' });

    expect(updated?.name).toBe('Distribuidora Actualizada');
  });

  it('debe cambiar el estado de un proveedor mediante PATCH /status', () => {
    let completed = false;
    service.changeSupplierStatus('sup-1', false).subscribe(() => {
      completed = true;
    });

    const req = httpTesting.expectOne('https://api.nalunpos.com/api/v1/suppliers/sup-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush(null);

    expect(completed).toBe(true);
  });
});
