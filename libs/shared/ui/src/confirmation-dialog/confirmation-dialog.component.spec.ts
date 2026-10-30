import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    dialogRefMock = {
      close: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConfirmationDialogComponent,
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Eliminar Registro',
            message: '¿Confirma eliminar?',
            confirmText: 'SÍ',
            cancelText: 'NO',
            variant: 'orchid',
          },
        },
      ],
    });
  });

  it('debe inicializar señales reactivas con los datos provistos', () => {
    const comp = TestBed.inject(ConfirmationDialogComponent);
    expect((comp as any).title()).toBe('Eliminar Registro');
    expect((comp as any).message()).toBe('¿Confirma eliminar?');
    expect((comp as any).confirmText()).toBe('SÍ');
    expect((comp as any).cancelText()).toBe('NO');
    expect((comp as any).variant()).toBe('orchid');
  });

  it('debe cerrar el diálogo con false en onCancel y true en onConfirm', () => {
    const comp = TestBed.inject(ConfirmationDialogComponent);
    (comp as any).onCancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);

    (comp as any).onConfirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });
});
