// =============================================================================
// ToastNotificationComponent — @nalunpos/shared/ui
// Componente Toast con diseño Light Glassmorphism SaaS para MatSnackBar (Angular 22)
// Paleta Morado (#ACA0E7) & Celeste (#92AAE7) - Versión Compacta Slim
// =============================================================================

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { NotificationData } from './notification.model';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="glass-pill-snackbar rounded-xl p-3 border relative overflow-hidden group w-full min-w-[320px] max-w-md"
      [ngClass]="borderClass"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Auto-drain progress bar at bottom -->
      <div
        class="absolute bottom-0 left-0 h-[2px] progress-bar-anim rounded-full"
        [ngClass]="progressClass"
        [style.animationDuration.ms]="durationMs"
        [style.animationPlayState]="isPaused() ? 'paused' : 'running'"
      ></div>

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <!-- Status Dot & Pulse Ring -->
          <div class="relative flex items-center justify-center shrink-0">
            <span class="w-2.5 h-2.5 rounded-full shadow-xs" [ngClass]="dotClass"></span>
            <span class="absolute w-4 h-4 rounded-full pulse-dot" [ngClass]="ringClass"></span>
          </div>

          <!-- Content Text Block -->
          <div class="text-left leading-tight w-full">
            <div class="flex items-center gap-1.5">
              @if (data.title) {
                <span class="text-xs font-bold text-[#1E1B2E] tracking-tight font-sans">{{ data.title }}</span>
              }
              @if (badgeLabel) {
                <span
                  class="hidden sm:inline-flex px-1.5 py-0.2 text-[9px] font-extrabold rounded uppercase border tracking-wider shrink-0"
                  [ngClass]="badgeClass"
                >
                  {{ badgeLabel }}
                </span>
              }
            </div>
            <p class="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight font-sans" style="word-break: break-word;">{{ data.message }}</p>
          </div>
        </div>

        <!-- Right Action & Close Buttons -->
        <div class="flex items-center gap-1.5 shrink-0">
          @if (data.actionText) {
            <button
              type="button"
              (click)="handleAction()"
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase border shadow-2xs transition active:scale-95 flex items-center gap-1 cursor-pointer font-sans"
              [ngClass]="actionBtnClass"
            >
              <span>{{ data.actionText }}</span>
            </button>
          }
          <button
            type="button"
            (click)="dismiss()"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Cerrar"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-pill-snackbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 
        0 8px 20px -4px rgba(172, 160, 231, 0.18),
        0 3px 8px -2px rgba(146, 170, 231, 0.1),
        inset 0 1px 1.5px rgba(255, 255, 255, 1);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .glass-pill-snackbar:hover {
      transform: translateY(-1px);
      box-shadow: 
        0 12px 24px -4px rgba(172, 160, 231, 0.25),
        0 4px 12px -2px rgba(146, 170, 231, 0.14),
        inset 0 1px 2px rgba(255, 255, 255, 1);
    }

    @keyframes subtle-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.65; transform: scale(1.12); }
    }
    .pulse-dot {
      animation: subtle-pulse 2.2s infinite ease-in-out;
    }

    @keyframes progress-drain {
      from { width: 100%; }
      to { width: 0%; }
    }
    .progress-bar-anim {
      animation: progress-drain 4.5s linear forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  readonly snackBarRef = inject(MatSnackBarRef<ToastNotificationComponent>);

  isPaused = signal(false);
  private timeoutId: any;
  private remainingTime: number = 0;
  private startTime: number = 0;

  ngOnInit() {
    this.remainingTime = this.durationMs;
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startTimer() {
    if (this.remainingTime <= 0) {
      this.dismiss();
      return;
    }
    this.startTime = Date.now();
    this.timeoutId = setTimeout(() => {
      this.dismiss();
    }, this.remainingTime);
  }

  clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  onMouseEnter() {
    this.isPaused.set(true);
    this.clearTimer();
    this.remainingTime -= (Date.now() - this.startTime);
  }

  onMouseLeave() {
    this.isPaused.set(false);
    this.startTimer();
  }

  get durationMs(): number {
    return this.data.type === 'error' ? 6000 : 4500;
  }

  get badgeLabel(): string | undefined {
    if (this.data.badgeText) {
      return this.data.badgeText;
    }
    switch (this.data.type) {
      case 'success':
        return 'ÉXITO';
      case 'error':
        return 'ERROR';
      case 'warning':
        return 'ALERTA';
      default:
        return 'INFO';
    }
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }

  handleAction(): void {
    if (this.data.onAction) {
      this.data.onAction();
    }
    this.dismiss();
  }

  get borderClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'border-[#ACA0E7]/30';
      case 'error':
        return 'border-rose-200/80';
      case 'warning':
        return 'border-amber-200/80';
      default:
        return 'border-[#92AAE7]/40';
    }
  }

  get progressClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-400 to-[#92AAE7]';
      case 'error':
        return 'bg-gradient-to-r from-rose-400 to-[#ACA0E7]';
      case 'warning':
        return 'bg-gradient-to-r from-amber-400 to-[#92AAE7]';
      default:
        return 'bg-gradient-to-r from-[#ACA0E7] via-[#92AAE7] to-[#DBE6FB]';
    }
  }

  get dotClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'bg-emerald-500 shadow-emerald-400/50';
      case 'error':
        return 'bg-rose-500 shadow-rose-400/50';
      case 'warning':
        return 'bg-amber-500 shadow-amber-400/50';
      default:
        return 'bg-[#687FE5] shadow-[#92AAE7]/50';
    }
  }

  get ringClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'bg-emerald-400/20';
      case 'error':
        return 'bg-rose-400/25';
      case 'warning':
        return 'bg-amber-400/25';
      default:
        return 'bg-[#92AAE7]/30';
    }
  }

  get badgeClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200/60';
      default:
        return 'bg-[#DBE6FB] text-[#2D509E] border-[#92AAE7]/30';
    }
  }

  get actionBtnClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'text-emerald-800 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 border-emerald-200';
      case 'error':
        return 'text-rose-800 bg-gradient-to-r from-rose-100 to-red-100 hover:from-rose-200 hover:to-red-200 border-rose-200';
      case 'warning':
        return 'text-amber-900 bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 border-amber-200';
      default:
        return 'text-[#544399] bg-gradient-to-r from-[#DEDAF4] to-[#DBE6FB] hover:from-[#d2ccf0] hover:to-[#cbdaf8] border-[#ACA0E7]/40';
    }
  }
}
