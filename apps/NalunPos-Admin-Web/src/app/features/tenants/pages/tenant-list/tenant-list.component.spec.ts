import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import type { PageEvent } from '@angular/material/paginator';
import { TenantListComponent } from './tenant-list.component';
import { TenantApiService } from '../../data-access/tenant-api.service';
import type { TenantDto } from '../../models/tenant.model';
import type { PagedResult } from '@nalunpos/shared/data-access';

describe('TenantListComponent', () => {
  let component: TenantListComponent;
  let apiMock: {
    getTenants: ReturnType<typeof vi.fn>;
    createTenant: ReturnType<typeof vi.fn>;
  };
  let dialogMock: {
    open: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    apiMock = {
      getTenants: vi.fn().mockReturnValue(of(mockPagedResult)),
      createTenant: vi.fn(),
    };

    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(false)),
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TenantApiService, useValue: apiMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    });

    TestBed.overrideComponent(TenantListComponent, {
      set: {
        template: '<div></div>',
        imports: [],
      },
    });

    const fixture = TestBed.createComponent(TenantListComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializarse y cargar la lista de tenants en ngOnInit', () => {
    component.ngOnInit();

    expect(apiMock.getTenants).toHaveBeenCalledWith(1, 10, '');
    expect(component['tenants']()).toEqual(mockTenants);
    expect(component['totalCount']()).toBe(2);
    expect(component['isLoading']()).toBe(false);
    expect(component['errorMessage']()).toBeNull();
  });

  it('debe manejar error al cargar tenants y actualizar el estado', () => {
    apiMock.getTenants.mockReturnValue(
      throwError(() => ({
        code: 'HTTP_500',
        message: 'Fallo al conectar con el servidor',
        status: 500,
      })),
    );

    component.ngOnInit();

    expect(component['isLoading']()).toBe(false);
    expect(component['errorMessage']()).toBe('Fallo al conectar con el servidor');
  });

  it('debe usar mensaje fallback si el error no tiene mensaje definido', () => {
    apiMock.getTenants.mockReturnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(component['errorMessage']()).toBe('No se pudieron cargar los Tenants de la plataforma.');
  });

  it('debe actualizar busqueda reactiva y reiniciar a pagina 0', () => {
    component.ngOnInit();
    expect(apiMock.getTenants).toHaveBeenCalledTimes(1);

    component['onSearchChange']('Alfa');

    expect(component['searchTerm']()).toBe('Alfa');
    expect(component['pageIndex']()).toBe(0);
    expect(apiMock.getTenants).toHaveBeenCalledWith(1, 10, 'Alfa');
  });

  it('debe actualizar paginacion y solicitar nueva pagina', () => {
    component.ngOnInit();

    const pageEvent: PageEvent = {
      pageIndex: 2,
      pageSize: 25,
      length: 100,
    };

    component['onPageChange'](pageEvent);

    expect(component['pageIndex']()).toBe(2);
    expect(component['pageSize']()).toBe(25);
    expect(apiMock.getTenants).toHaveBeenCalledWith(3, 25, '');
  });

  it('debe cambiar el filtro rapido de estado', () => {
    expect(component['selectedStatusFilter']()).toBe('all');

    component['setStatusFilter']('Active');
    expect(component['selectedStatusFilter']()).toBe('Active');
  });

  it('debe conmutar la visibilidad de los filtros avanzados', () => {
    expect(component['showAdvancedFilters']()).toBe(false);

    component['toggleAdvancedFilters']();
    expect(component['showAdvancedFilters']()).toBe(true);

    component['toggleAdvancedFilters']();
    expect(component['showAdvancedFilters']()).toBe(false);
  });

  it('debe abrir modal de creacion de tenant y recargar si se crea', () => {
    dialogMock.open.mockReturnValue({
      afterClosed: vi.fn().mockReturnValue(of(true)),
    });

    component['openCreateModal']();

    expect(dialogMock.open).toHaveBeenCalledOnce();
    expect(apiMock.getTenants).toHaveBeenCalled();
  });

  it('debe abrir modal de creacion de tenant y no recargar si se cancela', () => {
    dialogMock.open.mockReturnValue({
      afterClosed: vi.fn().mockReturnValue(of(false)),
    });
    apiMock.getTenants.mockClear();

    component['openCreateModal']();

    expect(dialogMock.open).toHaveBeenCalledOnce();
    expect(apiMock.getTenants).not.toHaveBeenCalled();
  });
});
