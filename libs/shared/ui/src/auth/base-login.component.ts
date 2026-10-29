import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { form, submit, required, pattern, minLength, FormField } from '@angular/forms/signals';
import { AUTH_GATEWAY } from '../layout/nav-config.interface';
import { LOGIN_CONFIG } from './login-config.interface';

interface LoginFormModel {
  email: string;
  password: string;
}

@Component({
  selector: 'ui-base-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FormField],
  templateUrl: './base-login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseLoginComponent {
  protected readonly formFieldDirective = FormField;
  private readonly authGateway = inject(AUTH_GATEWAY);
  private readonly router = inject(Router);
  protected readonly config = inject(LOGIN_CONFIG);

  protected readonly tenantIdentifier = signal(
    this.config.defaultTenantIdentifier ?? 'central-cafe',
  );

  private readonly formModel = signal<LoginFormModel>({ email: '', password: '' });

  protected readonly loginForm = form(this.formModel, (fields) => {
    required(fields.email);
    pattern(fields.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    required(fields.password);
    minLength(fields.password, 6);
  });

  protected readonly emailField = this.loginForm.email;
  protected readonly passwordField = this.loginForm.password;

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected async onSubmit(): Promise<void> {
    await submit(this.loginForm, async () => {
      const currentModel = this.formModel();
      const credentials = {
        email: currentModel.email,
        password: currentModel.password,
        tenantId: this.config.showTenantField ? this.tenantIdentifier() : undefined,
      };

      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.authGateway.login(credentials).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate([this.config.redirectRoute]);
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          const err = error as { message?: string };
          this.errorMessage.set(
            err?.message || 'Credenciales incorrectas. Por favor, intenta de nuevo.',
          );
        },
      });
    });
  }
}
