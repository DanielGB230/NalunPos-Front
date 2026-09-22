import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@nalunpos/shared/auth';
import { filter, map, startWith } from 'rxjs';
import { LayoutService } from '../../services/layout.service';

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

  // URL de la ruta activa convertida a Signal
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Nombre reactivo del módulo activo
  protected readonly activeModuleName = computed(() => {
    const url = this.currentUrl() ?? '';
    if (url.includes('/tenants')) return 'Tenants & Empresas';
    if (url.includes('/planes')) return 'Planes & Suscripciones';
    if (url.includes('/plataforma')) return 'Config. Plataforma';
    if (url.includes('/usuarios-admin')) return 'Usuarios Admin';
    if (url.includes('/dashboard')) return 'Dashboard';
    return 'SuperAdmin';
  });

  protected readonly isSidebarCollapsed = this.layoutService.isSidebarCollapsed;

  protected toggleUserMenu(): void {
    this.showUserMenu.update((prev) => !prev);
  }

  protected toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  protected toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
