import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, FormField],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly formFieldDirective = FormField;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Modo de Autenticación (Portal Empresas vs Ingreso SuperAdmin)
  protected readonly authMode = signal<'tenant' | 'admin'>('admin');
  protected readonly tenantIdentifier = signal('central-cafe');

  // Signal Form - Angular 22
  private readonly formModel = signal<LoginFormModel>({ email: '', password: '' });

  protected readonly loginForm = form(this.formModel, (fields) => {
    required(fields.email);
    pattern(fields.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    required(fields.password);
    minLength(fields.password, 6);
  });

  protected readonly emailField = this.loginForm.email;
  protected readonly passwordField = this.loginForm.password;

  // Estado del componente con Signals
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected switchMode(mode: 'tenant' | 'admin'): void {
    this.authMode.set(mode);
    this.errorMessage.set(null);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected async onSubmit(): Promise<void> {
    await submit(this.loginForm, async () => {
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
    });
  }
}
