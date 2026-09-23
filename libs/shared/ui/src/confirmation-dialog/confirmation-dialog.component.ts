import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogData, ConfirmationVariant } from './confirmation-dialog.model';

@Component({
  selector: 'lib-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent, boolean>);
  public readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {
    title: 'Confirmar Acción',
    message: '¿Está seguro de realizar esta acción?',
  };

  protected readonly title = signal(this.data.title || 'Confirmar Acción');
  protected readonly message = signal(this.data.message || '¿Está seguro de realizar esta acción?');
  protected readonly subMessage = signal(this.data.subMessage || '');
  protected readonly confirmText = signal(this.data.confirmText || 'SÍ, CONFIRMAR');
  protected readonly cancelText = signal(this.data.cancelText || 'CANCELAR');
  protected readonly variant = signal<ConfirmationVariant>(this.data.variant || 'purple');

  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
