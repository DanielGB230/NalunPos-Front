import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import type { ConfirmationDialogData } from './confirmation-dialog.model';

describe('ConfirmationDialogService', () => {
  let service: ConfirmationDialogService;
  let dialogMock: { open: ReturnType<typeof vi.fn> };

  const mockData: ConfirmationDialogData = {
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de eliminar el registro?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    isDanger: true,
  };

  beforeEach(() => {
    dialogMock = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConfirmationDialogService,
        { provide: MatDialog, useValue: dialogMock },
      ],
    });

    service = TestBed.inject(ConfirmationDialogService);
  });

  it('debe abrir el modal con los datos provistos y retornar true al confirmar', async () => {
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    const result = await service.confirmAsync(mockData);

    expect(dialogMock.open).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      expect.objectContaining({
        data: mockData,
        panelClass: 'confirmation-dialog-panel',
      }),
    );
    expect(result).toBe(true);
  });

  it('debe retornar false cuando el usuario cancela o cierra el modal', async () => {
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    const result = await service.confirmAsync(mockData);

    expect(result).toBe(false);
  });
});
