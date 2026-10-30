import type { Signal, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { APP_NAV_CONFIG, AUTH_GATEWAY } from '@nalunpos/shared/util';
import { LayoutService } from './layout.service';

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly authGateway = inject(AUTH_GATEWAY);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);
  protected readonly config = inject(APP_NAV_CONFIG);

  protected readonly isHovered: WritableSignal<boolean> = signal(false);
  protected readonly isSidebarCollapsed: Signal<boolean> = this.layoutService.isSidebarCollapsed;
  protected readonly isMobileMenuOpen: Signal<boolean> = this.layoutService.isMobileMenuOpen;
  protected readonly isMasterCollapsed: WritableSignal<boolean> = signal(false);

  // El sidebar sólo está visualmente contraído si está colapsado Y el ratón NO está encima (hover)
  protected readonly isCollapsed: Signal<boolean> = computed(
    () => this.isSidebarCollapsed() && !this.isHovered(),
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
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return;
      }
    }
    this.isHovered.set(false);
  }

  // Estado inicial de grupos: primer grupo expandido (false), siguientes colapsados (true)
  private readonly initialGroupState: Record<string, boolean> = this.config.navGroups.reduce(
    (acc, group, index) => {
      acc[group.key] = index > 0;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  protected readonly groupCollapsedState: WritableSignal<Record<string, boolean>> = signal<
    Record<string, boolean>
  >(this.initialGroupState);

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
    const updated: Record<string, boolean> = {};
    for (const group of this.config.navGroups) {
      updated[group.key] = nextState;
    }
    this.groupCollapsedState.set(updated);
  }

  protected closeMobileMenu(): void {
    this.layoutService.closeMobileMenu();
  }

  protected logout(): void {
    this.closeMobileMenu();
    this.authGateway.logout();
    this.router.navigate(['/login']);
  }
}
