import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { APP_NAV_CONFIG, AUTH_GATEWAY } from './nav-config.interface';
import { LayoutService } from './layout.service';

@Component({
  selector: 'ui-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly authGateway = inject(AUTH_GATEWAY);
  private readonly navConfig = inject(APP_NAV_CONFIG);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);

  protected readonly currentUser = this.authGateway.currentUser;
  protected readonly config = this.navConfig;
  protected readonly showUserMenu = signal(false);

  // URL de la ruta activa convertida a Signal
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  // Nombre reactivo del módulo activo según la configuración inyectada
  protected readonly activeModuleName = computed(() => {
    const url = this.currentUrl() ?? '';
    const mapEntries = Object.entries(this.navConfig.moduleMap);
    for (const [routePrefix, name] of mapEntries) {
      if (url.includes(routePrefix)) {
        return name;
      }
    }
    return this.navConfig.defaultModuleName;
  });

  protected readonly isSidebarCollapsed = this.layoutService.isSidebarCollapsed;

  protected toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  protected toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  protected toggleUserMenu(): void {
    this.showUserMenu.update((prev) => !prev);
  }

  protected logout(): void {
    this.authGateway.logout();
    this.router.navigate(['/login']);
  }
}
