// =============================================================================
// ConfirmationDialog Model — @nalunpos/shared/ui
// Interfaces y tipos para el modal global de confirmación de acciones.
// =============================================================================

export type ConfirmationVariant = 'purple' | 'danger' | 'warning' | 'info' | 'success' | 'orchid';

export type ConfirmationIconType = 'question' | 'warning' | 'danger' | 'info' | 'check' | 'trash';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  icon?: ConfirmationIconType;
}
