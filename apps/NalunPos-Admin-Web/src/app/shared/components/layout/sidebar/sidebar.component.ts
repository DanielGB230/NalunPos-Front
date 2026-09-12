import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  protected readonly isCollapsed = signal(false);

  protected readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Tenants & Empresas',
      route: '/tenants',
      icon: 'tenants',
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      label: 'Planes & Suscripciones',
      route: '/planes',
      icon: 'planes',
    },
    {
      label: 'Config. Plataforma',
      route: '/plataforma',
      icon: 'plataforma',
    },
    {
      label: 'Usuarios Admin',
      route: '/usuarios-admin',
      icon: 'usuarios',
    },
  ];

  protected toggleCollapse(): void {
    this.isCollapsed.update((prev) => !prev);
  }
}
