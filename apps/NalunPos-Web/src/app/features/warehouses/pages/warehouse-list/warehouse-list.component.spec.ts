import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarehouseListComponent } from './warehouse-list.component';
import { WarehouseApiService } from '../../data-access/warehouse-api.service';
import { NotificationService } from '@nalunpos/shared/ui';
import { MatDialog } from '@angular/material/dialog';
import type { Warehouse } from '../../models/warehouse.interface';

describe('WarehouseListComponent', () => {
  let component: WarehouseListComponent;
  let apiMock: {
    getWarehouses: ReturnType<typeof vi.fn>;
    createWarehouse: ReturnType<typeof vi.fn>;
  };
  let notificationMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };
  let dialogMock: {
    open: ReturnType<typeof vi.fn>;
  };

  const mockWarehouses: Warehouse[] = [
    {
      id: 'wh-1',
      tenantId: 'tenant-1',
      name: 'Almacen Principal',
      description: 'Central',
      branchId: 'br-1',
      isDefault: true,
      isActive: true,
      createdAtUtc: '2026-10-28T10:00:00Z',
    },
    {
      id: 'wh-2',
      tenantId: 'tenant-1',
      name: 'Bodega Secundaria',
      description: 'Norte',
      branchId: 'br-2',
      isDefault: false,
      isActive: false,
      createdAtUtc: '2026-10-28T11:00:00Z',
    },
  ];

  beforeEach(async () => {
    apiMock = {
      getWarehouses: vi.fn().mockReturnValue(of(mockWarehouses)),
      createWarehouse: vi.fn(),
    };

    notificationMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    dialogMock = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: WarehouseApiService, useValue: apiMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    });

    TestBed.overrideComponent(WarehouseListComponent, {
      set: {
        template: '<div></div>',
        imports: [],
      },
    });

    const fixture = TestBed.createComponent(WarehouseListComponent);
    component = fixture.componentInstance;
  });

  it('debe inicializarse y cargar los almacenes en ngOnInit', () => {
    component.ngOnInit();

    expect(apiMock.getWarehouses).toHaveBeenCalledOnce();
    expect(component['warehouses']()).toEqual(mockWarehouses);
    expect(component['isLoading']()).toBe(false);
    expect(component['totalCount']()).toBe(2);
  });

  it('debe filtrar almacenes por busqueda reactiva', () => {
    component.ngOnInit();
    expect(component['filteredWarehouses']().length).toBe(2);

    component['onSearchChange']('Secundaria');
    expect(component['filteredWarehouses']().length).toBe(1);
    expect(component['filteredWarehouses']()[0]?.name).toBe('Bodega Secundaria');
  });

  it('debe filtrar almacenes por estado activo e inactivo', () => {
    component.ngOnInit();

    component['setStatusFilter']('active');
    expect(component['filteredWarehouses']().length).toBe(1);
    expect(component['filteredWarehouses']()[0]?.isActive).toBe(true);

    component['setStatusFilter']('inactive');
    expect(component['filteredWarehouses']().length).toBe(1);
    expect(component['filteredWarehouses']()[0]?.isActive).toBe(false);
  });

  it('debe manejar errores de carga y emitir notificacion', () => {
    apiMock.getWarehouses.mockReturnValue(throwError(() => new Error('Error de conexion')));
    component['loadWarehouses']();

    expect(component['isLoading']()).toBe(false);
    expect(notificationMock.error).toHaveBeenCalledWith(
      'Error al conectar con el servidor.',
      'Error de carga',
    );
  });

  it('debe manejar cambio de paginacion con onPageChange', () => {
    component['onPageChange']({ pageIndex: 2, pageSize: 20, length: 50 });
    expect(component['pageIndex']()).toBe(2);
    expect(component['pageSize']()).toBe(20);
  });

  it('debe alternar filtros avanzados con toggleAdvancedFilters', () => {
    expect(component['showAdvancedFilters']()).toBe(false);
    component['toggleAdvancedFilters']();
    expect(component['showAdvancedFilters']()).toBe(true);
    component['toggleAdvancedFilters']();
    expect(component['showAdvancedFilters']()).toBe(false);
  });

  it('debe abrir dialogo de creacion de almacen y recargar si se guarda', () => {
    const dialogRefMock = {
      afterClosed: vi.fn().mockReturnValue(of(true)),
    };
    dialogMock.open.mockReturnValue(dialogRefMock);

    component['openWarehouseDialog']();

    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { warehouse: undefined } }),
    );
    expect(apiMock.getWarehouses).toHaveBeenCalled();
  });

  it('debe abrir dialogo de edicion de almacen y no recargar si se cancela', () => {
    const dialogRefMock = {
      afterClosed: vi.fn().mockReturnValue(of(false)),
    };
    dialogMock.open.mockReturnValue(dialogRefMock);

    apiMock.getWarehouses.mockClear();
    component['openWarehouseDialog'](mockWarehouses[0]);

    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { warehouse: mockWarehouses[0] } }),
    );
    expect(apiMock.getWarehouses).not.toHaveBeenCalled();
  });

  it('debe calcular métricas derivadas y paginación computada', () => {
    component.ngOnInit();
    expect(component['activeCount']()).toBe(1);
    expect(component['inactiveCount']()).toBe(1);
    expect(component['defaultWarehouse']()?.id).toBe('wh-1');
    expect(component['paginatedWarehouses']().length).toBe(2);
  });

  it('debe filtrar almacenes por coincidencia en la descripción', () => {
    component.ngOnInit();
    component['onSearchChange']('Central');
    expect(component['filteredWarehouses']().length).toBe(1);
    expect(component['filteredWarehouses']()[0]?.id).toBe('wh-1');
  });

  it('debe computar metricsCards con y sin almacenes asignados', () => {
    component.ngOnInit();
    const metrics = component['metricsCards']();
    expect(metrics.length).toBe(4);
    expect(metrics[1]?.progressPercent).toBe(50);
    expect(metrics[2]?.progressPercent).toBe(50);
    expect(metrics[3]?.value).toBe('Almacen Principal');

    component['warehouses'].set([]);
    const emptyMetrics = component['metricsCards']();
    expect(emptyMetrics[1]?.progressPercent).toBe(0);
    expect(emptyMetrics[2]?.progressPercent).toBe(0);
    expect(emptyMetrics[3]?.value).toBe('No asignado');
  });
});
