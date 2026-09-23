import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogData } from './confirmation-dialog.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);

  /**
   * Abre el modal global de confirmación y retorna un Observable con el resultado (true si confirma, false si cancela/cierra).
   */
  public confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmationDialogComponent, boolean> = this.dialog.open(
      ConfirmationDialogComponent,
      {
        data,
        panelClass: 'confirmation-dialog-panel',
        disableClose: false,
        autoFocus: false,
        width: '390px',
        maxWidth: '90vw',
      }
    );

    return dialogRef.afterClosed().pipe(map((res: boolean | undefined) => !!res));
  }

  /**
   * Método conveniente async/await para solicitar confirmación del usuario.
   */
  public async confirmAsync(data: ConfirmationDialogData): Promise<boolean> {
    const result: boolean = await firstValueFrom(this.confirm(data));
    return !!result;
  }
}
