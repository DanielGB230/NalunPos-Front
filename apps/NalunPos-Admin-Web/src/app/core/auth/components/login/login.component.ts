// =============================================================================
// LoginComponent — NalunPos-Web
// Signal Forms Angular 22 — API verificada desde los tipos del paquete
// Forma correcta: form(signal, (fields) => { required(fields.x); minLength(...) })
// ADR-0005: Signal Forms obligatorio. Reactive Forms clásico prohibido.
// =============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  form,
  submit,
  required,
  pattern,
  minLength,
  FormField,
} from '@angular/forms/signals';
import { AuthService } from '@nalunpos/shared/auth';
import type { LoginRequest } from '@nalunpos/shared/auth';
import { AppError } from '@nalunpos/shared/data-access';

interface LoginFormModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly formFieldDirective = FormField;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ─── Signal Form — API verificada Angular 22.1.6 ────────────────────────────
  // form() recibe: WritableSignal<TModel> + SchemaFn(fields) con validadores funcionales
  private readonly formModel = signal<LoginFormModel>({ email: '', password: '' });

  protected readonly loginForm = form(this.formModel, (fields) => {
    required(fields.email);
    pattern(fields.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    required(fields.password);
    minLength(fields.password, 6);
  });

  // ─── Acceso a los campos individuales ────────────────────────────────────────
  protected readonly emailField = this.loginForm.email;
  protected readonly passwordField = this.loginForm.password;

  // ─── Estado del componente ──────────────────────────────────────────────────
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  // ─── Acciones ───────────────────────────────────────────────────────────────
  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected async onSubmit(): Promise<void> {
    // submit() marca todos los campos como touched y retorna Promise<boolean>
    const isValid = await submit(this.loginForm);
    if (!isValid) return;

    const currentModel = this.formModel();
    const credentials: LoginRequest = {
      email: currentModel.email,
      password: currentModel.password,
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error: AppError) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Credenciales incorrectas. Por favor, intenta de nuevo.',
        );
      },
    });
  }
}
