import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastNotificationComponent } from './toast-notification.component';
import type { NotificationData } from './notification.model';

describe('ToastNotificationComponent', () => {
  let snackBarRefMock: { dismiss: ReturnType<typeof vi.fn> };
  let mockData: NotificationData;

  beforeEach(() => {
    vi.useFakeTimers();
    snackBarRefMock = {
      dismiss: vi.fn(),
    };
    mockData = {
      title: 'Notificación',
      message: 'Operación realizada con éxito',
      type: 'success',
      badgeText: 'CUSTOM',
      onAction: vi.fn(),
      actionText: 'Deshacer',
    };

    TestBed.configureTestingModule({
      providers: [
        ToastNotificationComponent,
        { provide: MatSnackBarRef, useValue: snackBarRefMock },
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe inicializarse con temporizador y descartarse al finalizar el tiempo', () => {
    const comp = TestBed.inject(ToastNotificationComponent);
    comp.ngOnInit();

    expect(comp.durationMs).toBe(4500);
    expect(comp.badgeLabel).toBe('CUSTOM');
    expect(comp.borderClass).toContain('border');
    expect(comp.progressClass).toContain('emerald');
    expect(comp.dotClass).toContain('emerald');
    expect(comp.pulseAuraClass).toContain('emerald');
    expect(comp.badgeClass).toContain('emerald');
    expect(comp.actionBtnClass).toContain('emerald');

    vi.advanceTimersByTime(4500);
    expect(snackBarRefMock.dismiss).toHaveBeenCalledTimes(1);

    comp.ngOnDestroy();
  });

  it('debe pausar y reanudar el temporizador con mouseenter y mouseleave', () => {
    const comp = TestBed.inject(ToastNotificationComponent);
    comp.ngOnInit();

    vi.advanceTimersByTime(2000);
    comp.onMouseEnter();
    expect(comp.isPaused()).toBe(true);

    vi.advanceTimersByTime(5000);
    expect(snackBarRefMock.dismiss).not.toHaveBeenCalled();

    comp.onMouseLeave();
    expect(comp.isPaused()).toBe(false);

    vi.advanceTimersByTime(2500);
    expect(snackBarRefMock.dismiss).toHaveBeenCalledTimes(1);

    comp.ngOnDestroy();
  });

  it('debe ejecutar la acción y descartar el snackbar al invocar handleAction', () => {
    const comp = TestBed.inject(ToastNotificationComponent);
    comp.handleAction();

    expect(mockData.onAction).toHaveBeenCalledTimes(1);
    expect(snackBarRefMock.dismiss).toHaveBeenCalledTimes(1);
  });

  it('debe calcular clases y duración para tipo error', () => {
    TestBed.resetTestingModule();
    const errorData: NotificationData = {
      message: 'Falló la petición',
      type: 'error',
    };
    TestBed.configureTestingModule({
      providers: [
        ToastNotificationComponent,
        { provide: MatSnackBarRef, useValue: snackBarRefMock },
        { provide: MAT_SNACK_BAR_DATA, useValue: errorData },
      ],
    });

    const comp = TestBed.inject(ToastNotificationComponent);
    expect(comp.durationMs).toBe(6000);
    expect(comp.badgeLabel).toBe('ERROR');
    expect(comp.borderClass).toContain('rose');
    expect(comp.progressClass).toContain('rose');
    expect(comp.dotClass).toContain('rose');
    expect(comp.pulseAuraClass).toContain('rose');
    expect(comp.badgeClass).toContain('rose');
    expect(comp.actionBtnClass).toContain('rose');
  });

  it('debe calcular clases para tipo warning e info por defecto', () => {
    TestBed.resetTestingModule();
    const warningData: NotificationData = {
      message: 'Cuidado',
      type: 'warning',
    };
    TestBed.configureTestingModule({
      providers: [
        ToastNotificationComponent,
        { provide: MatSnackBarRef, useValue: snackBarRefMock },
        { provide: MAT_SNACK_BAR_DATA, useValue: warningData },
      ],
    });

    const compWarn = TestBed.inject(ToastNotificationComponent);
    expect(compWarn.badgeLabel).toBe('ALERTA');
    expect(compWarn.borderClass).toContain('amber');

    TestBed.resetTestingModule();
    const infoData: NotificationData = {
      message: 'Aviso general',
      type: 'info',
    };
    TestBed.configureTestingModule({
      providers: [
        ToastNotificationComponent,
        { provide: MatSnackBarRef, useValue: snackBarRefMock },
        { provide: MAT_SNACK_BAR_DATA, useValue: infoData },
      ],
    });

    const compInfo = TestBed.inject(ToastNotificationComponent);
    expect(compInfo.badgeLabel).toBe('INFO');
    expect(compInfo.borderClass).toContain('border-[#92AAE7]');
  });
});
