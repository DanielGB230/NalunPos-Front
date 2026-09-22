import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@nalunpos/shared/auth';
import { LayoutService } from '../../services/layout.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  key: string;
  title: string;
  colorDot: string;
  groupIcon: string;
  groupIconColor: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);

  protected readonly isHovered = signal(false);
  protected readonly isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
  protected readonly isMobileMenuOpen = this.layoutService.isMobileMenuOpen;
  protected readonly isMasterCollapsed = signal(false);

  // El sidebar sólo está visualmente contraído si está colapsado Y el ratón NO está encima (hover)
  protected readonly isCollapsed = computed(
    () => this.isSidebarCollapsed() && !this.isHovered()
  );

  protected onMouseEnter(): void {
    if (this.isSidebarCollapsed()) {
      this.isHovered.set(true);
    }
  }

  protected onMouseLeave(event?: MouseEvent): void {
    if (event && event.currentTarget instanceof HTMLElement) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      // Si las coordenadas del cursor están dentro del rectángulo del sidebar, ignorar la contracción por eventos sintéticos
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return;
      }
    }
    this.isHovered.set(false);
  }

  // Estado de grupos colapsados
  protected readonly groupCollapsedState = signal<Record<string, boolean>>({
    tenants: false,
    sistemica: true,
  });

  protected readonly navGroups: NavGroup[] = [
    {
      key: 'tenants',
      title: 'TENANTS & NEGOCIOS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'tenants',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
        { label: 'Tenants & Empresas', route: '/tenants', icon: 'tenants', badge: 'LIVE' },
        { label: 'Planes & Suscripciones', route: '/planes', icon: 'planes' },
      ],
    },
    {
      key: 'sistemica',
      title: 'SISTÉMICA & SHARDS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'sistemica',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Config. Plataforma', route: '/plataforma', icon: 'plataforma' },
        { label: 'Usuarios Admin', route: '/usuarios-admin', icon: 'usuarios' },
      ],
    },
  ];

  protected toggleCollapse(): void {
    this.layoutService.toggleSidebar();
  }

  protected toggleGroup(groupKey: string): void {
    this.groupCollapsedState.update((state) => ({
      ...state,
      [groupKey]: !state[groupKey],
    }));
  }

  protected toggleMasterCollapse(): void {
    const nextState = !this.isMasterCollapsed();
    this.isMasterCollapsed.set(nextState);
    this.groupCollapsedState.set({
      tenants: nextState,
      sistemica: nextState,
    });
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
