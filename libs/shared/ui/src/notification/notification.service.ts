// =============================================================================
// NotificationService — @nalunpos/shared/ui
// Servicio global reusable de Notificaciones Toast (Angular 22 + MatSnackBar)
// Basado en el sistema de diseño Light Glassmorphism SaaS
// =============================================================================

import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastNotificationComponent } from './toast-notification.component';
import { NotificationData } from './notification.model';

export interface NotificationOptions {
  title?: string;
  badgeText?: string;
  actionText?: string;
  onAction?: () => void;
  config?: Partial<MatSnackBarConfig<NotificationData>>;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Muestra un mensaje de éxito.
   */
  success(message: string, options?: string | NotificationOptions): void {
    const opts = typeof options === 'string' ? { title: options } : options;
    this.show({
      message,
      title: opts?.title ?? 'Cambios Guardados',
      badgeText: opts?.badgeText,
      actionText: opts?.actionText,
      onAction: opts?.onAction,
      type: 'success',
    }, opts?.config);
  }

  /**
   * Muestra un mensaje de error.
   */
  error(message: string, options?: string | NotificationOptions): void {
    const opts = typeof options === 'string' ? { title: options } : options;
    this.show({
      message,
      title: opts?.title ?? 'Error del Servidor',
      badgeText: opts?.badgeText,
      actionText: opts?.actionText,
      onAction: opts?.onAction,
      type: 'error',
    }, opts?.config);
  }

  /**
   * Muestra un mensaje de advertencia.
   */
  warning(message: string, options?: string | NotificationOptions): void {
    const opts = typeof options === 'string' ? { title: options } : options;
    this.show({
      message,
      title: opts?.title ?? 'Advertencia',
      badgeText: opts?.badgeText,
      actionText: opts?.actionText,
      onAction: opts?.onAction,
      type: 'warning',
    }, opts?.config);
  }

  /**
   * Muestra un mensaje informativo.
   */
  info(message: string, options?: string | NotificationOptions): void {
    const opts = typeof options === 'string' ? { title: options } : options;
    this.show({
      message,
      title: opts?.title ?? 'Notificación',
      badgeText: opts?.badgeText,
      actionText: opts?.actionText,
      onAction: opts?.onAction,
      type: 'info',
    }, opts?.config);
  }

  /**
   * Método principal para abrir el MatSnackBar personalizado.
   * Posicionado en la esquina Superior Derecha (top-end).
   */
  show(data: NotificationData, customConfig?: Partial<MatSnackBarConfig<NotificationData>>): void {
    const defaultConfig: MatSnackBarConfig<NotificationData> = {
      duration: 0, // Se maneja internamente en el componente para permitir pausa
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['custom-toast-container', `toast-panel-${data.type}`],
      data,
    };

    const finalConfig: MatSnackBarConfig<NotificationData> = { ...defaultConfig, ...customConfig };

    this.snackBar.openFromComponent(ToastNotificationComponent, finalConfig);
  }
}
