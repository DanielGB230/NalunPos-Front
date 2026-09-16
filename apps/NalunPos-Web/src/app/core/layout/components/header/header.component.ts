import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '@nalunpos/shared/auth';
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
  protected readonly tenantId = this.authService.tenantId;
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
    if (url.includes('/categorias')) return 'Categorías';
    if (url.includes('/productos')) return 'Productos';
    if (url.includes('/ventas')) return 'Ventas & POS';
    if (url.includes('/inventario')) return 'Inventario';
    if (url.includes('/clientes')) return 'Clientes';
    if (url.includes('/usuarios')) return 'Usuarios';
    if (url.includes('/dashboard')) return 'Dashboard';
    return 'POS Operations';
  });

  protected toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  protected toggleUserMenu(): void {
    this.showUserMenu.update((prev) => !prev);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
