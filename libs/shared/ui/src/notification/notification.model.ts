// =============================================================================
// Notification Model — @nalunpos/shared/ui
// Modelos y tipos para el sistema global de notificaciones Toast/SnackBar
// Basado en el sistema de diseño Light Glassmorphism SaaS
// =============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
  title?: string;
  message: string;
  type: NotificationType;
  badgeText?: string;
  actionText?: string;
  onAction?: () => void;
}
