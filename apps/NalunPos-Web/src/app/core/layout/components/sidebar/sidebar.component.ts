import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@nalunpos/shared/auth';
import { LayoutService } from '../../services/layout.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);

  protected readonly isCollapsed = signal(false);
  protected readonly isMobileMenuOpen = this.layoutService.isMobileMenuOpen;

  protected readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Ventas & POS',
      route: '/ventas',
      icon: 'ventas',
      badge: 'POS',
    },
    {
      label: 'Productos',
      route: '/productos',
      icon: 'productos',
    },
    {
      label: 'Categorías',
      route: '/categorias',
      icon: 'categorias',
    },
    {
      label: 'Inventario',
      route: '/inventario',
      icon: 'inventario',
    },
    {
      label: 'Clientes',
      route: '/clientes',
      icon: 'clientes',
    },
    {
      label: 'Usuarios',
      route: '/usuarios',
      icon: 'usuarios',
    },
  ];

  protected toggleCollapse(): void {
    this.isCollapsed.update((prev) => !prev);
  }

  protected closeMobileMenu(): void {
    this.layoutService.closeMobileMenu();
  }

  protected logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
