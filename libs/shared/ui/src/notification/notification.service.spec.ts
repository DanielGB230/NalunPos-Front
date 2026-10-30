import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';
import { ToastNotificationComponent } from './toast-notification.component';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarMock: { openFromComponent: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarMock = {
      openFromComponent: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('debe emitir notificación de éxito con configuración por defecto', () => {
    service.success('Guardado correctamente');

    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(
      ToastNotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'end',
        verticalPosition: 'top',
        data: expect.objectContaining({
          message: 'Guardado correctamente',
          title: 'Cambios Guardados',
          type: 'success',
        }),
      }),
    );
  });

  it('debe aceptar título personalizado en string o en objeto', () => {
    service.success('Item guardado', 'Operación Exitosa');
    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(
      ToastNotificationComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Operación Exitosa',
          type: 'success',
        }),
      }),
    );

    service.error('Falló la conexión', { title: 'Error de Red', badgeText: '500' });
    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(
      ToastNotificationComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Error de Red',
          badgeText: '500',
          type: 'error',
        }),
      }),
    );
  });

  it('debe emitir notificaciones de warning e info correctamente', () => {
    service.warning('Cuidado con el stock', 'Stock Bajo');
    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(
      ToastNotificationComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'warning',
          title: 'Stock Bajo',
        }),
      }),
    );

    service.info('Nueva actualización', 'Sistema');
    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(
      ToastNotificationComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'info',
          title: 'Sistema',
        }),
      }),
    );
  });
});
