import type { Signal, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import type { ConfirmationDialogData, ConfirmationVariant } from './confirmation-dialog.model';

@Component({
  selector: 'lib-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule],
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

  protected readonly iconBoxClass: Signal<string> = computed(() => {
    switch (this.variant()) {
      case 'danger':
      case 'orchid':
        return 'bg-[#FCE7F0] border-[#E8A0BF] text-[#9B2C67]';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-600';
      case 'info':
        return 'bg-[#EEF3FE] border-[#C5D2F8] text-[#283FA7]';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      default:
        return 'bg-[#F0EDFC] border-[#DEDAF4] text-[#7C3AED]';
    }
  });

  protected readonly confirmBtnClass: Signal<string> = computed(() => {
    switch (this.variant()) {
      case 'danger':
      case 'orchid':
        return 'bg-[#9B2C67] hover:bg-[#852357] shadow-[#9B2C67]/35';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30';
      case 'info':
        return 'bg-[#283FA7] hover:bg-[#1E2B78] shadow-[#283FA7]/30';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30';
      default:
        return 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-[#7C3AED]/30';
    }
  });

  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
