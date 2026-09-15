import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((prev) => !prev);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen.set(true);
  }
}
