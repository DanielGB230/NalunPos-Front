import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@nalunpos/shared/auth';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly systemStatus = signal<'online' | 'maintenance'>('online');
  protected readonly showUserMenu = signal(false);

  protected toggleUserMenu(): void {
    this.showUserMenu.update((prev) => !prev);
  }

  protected toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
