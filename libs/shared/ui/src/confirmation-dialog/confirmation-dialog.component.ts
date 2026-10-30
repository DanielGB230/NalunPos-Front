import { NgClass } from '@angular/common';
import type { WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import type { ConfirmationDialogData, ConfirmationVariant } from './confirmation-dialog.model';

@Component({
  selector: 'lib-confirmation-dialog',
  standalone: true,
  imports: [NgClass, MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent, boolean>);
  public readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {
    title: 'Confirmar Acción',
    message: '¿Está seguro de realizar esta acción?',
  };

  protected readonly title: WritableSignal<string> = signal(this.data.title || 'Confirmar Acción');
  protected readonly message: WritableSignal<string> = signal(
    this.data.message || '¿Está seguro de realizar esta acción?',
  );
  protected readonly subMessage: WritableSignal<string> = signal(this.data.subMessage || '');
  protected readonly confirmText: WritableSignal<string> = signal(
    this.data.confirmText || 'SÍ, CONFIRMAR',
  );
  protected readonly cancelText: WritableSignal<string> = signal(
    this.data.cancelText || 'CANCELAR',
  );
  protected readonly variant: WritableSignal<ConfirmationVariant> = signal<ConfirmationVariant>(
    this.data.variant || 'purple',
  );

  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
