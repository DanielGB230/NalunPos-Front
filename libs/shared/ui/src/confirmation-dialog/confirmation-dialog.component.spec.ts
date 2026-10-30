import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import type { ConfirmationVariant } from './confirmation-dialog.model';

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
    expect((comp as any).iconBoxClass()).toContain('bg-[#FCE7F0]');
    expect((comp as any).confirmBtnClass()).toContain('bg-[#9B2C67]');
  });

  it('debe cerrar el diálogo con false en onCancel y true en onConfirm', () => {
    const comp = TestBed.inject(ConfirmationDialogComponent);
    (comp as any).onCancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);

    (comp as any).onConfirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('debe calcular clases para todas las variantes cromáticas', () => {
    const variants: { variant: ConfirmationVariant; icon: string; btn: string }[] = [
      { variant: 'purple', icon: 'bg-[#F0EDFC]', btn: 'bg-[#7C3AED]' },
      { variant: 'warning', icon: 'bg-amber-50', btn: 'bg-amber-600' },
      { variant: 'info', icon: 'bg-[#EEF3FE]', btn: 'bg-[#283FA7]' },
      { variant: 'success', icon: 'bg-emerald-50', btn: 'bg-emerald-600' },
      { variant: 'danger', icon: 'bg-[#FCE7F0]', btn: 'bg-[#9B2C67]' },
    ];

    for (const item of variants) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ConfirmationDialogComponent,
          { provide: MatDialogRef, useValue: dialogRefMock },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              title: 'Test',
              message: 'Test msg',
              variant: item.variant,
            },
          },
        ],
      });
      const comp = TestBed.inject(ConfirmationDialogComponent);
      expect((comp as any).iconBoxClass()).toContain(item.icon);
      expect((comp as any).confirmBtnClass()).toContain(item.btn);
    }
  });
});
