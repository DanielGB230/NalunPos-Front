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
    comercial: false,
    inventario: true,
    admin: true,
  });

  protected readonly navGroups: NavGroup[] = [
    {
      key: 'comercial',
      title: 'COMERCIAL & VENTAS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'comercial',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
        { label: 'Terminal POS (Caja)', route: '/ventas', icon: 'ventas' },
        { label: 'Clientes', route: '/clientes', icon: 'clientes' },
      ],
    },
    {
      key: 'inventario',
      title: 'INVENTARIO & RECETAS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'inventario',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Stock & Bodegas', route: '/inventario', icon: 'inventario' },
        { label: 'Almacenes', route: '/almacenes', icon: 'inventario' },
        { label: 'Productos', route: '/productos', icon: 'productos' },
        { label: 'Categorías', route: '/categorias', icon: 'categorias' },
        { label: 'Órdenes de Compra', route: '/compras', icon: 'compras' },
        { label: 'Proveedores', route: '/proveedores', icon: 'proveedores' },
      ],
    },
    {
      key: 'admin',
      title: 'ADMINISTRACIÓN & ACCESOS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'admin',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Usuarios & Roles', route: '/usuarios', icon: 'usuarios' },
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
      comercial: nextState,
      inventario: nextState,
      admin: nextState,
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
