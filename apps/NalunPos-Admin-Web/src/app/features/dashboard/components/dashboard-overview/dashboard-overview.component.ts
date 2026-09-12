import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantApiService } from '../../../tenants/services/tenant-api.service';
import { TenantDto } from '../../../tenants/models/tenant.model';

interface KpiStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewComponent implements OnInit {
  private readonly tenantApiService = inject(TenantApiService);

  protected readonly recentTenants = signal<TenantDto[]>([]);
  protected readonly totalTenantsCount = signal<number>(0);
  protected readonly isLoading = signal<boolean>(false);

  protected readonly kpiStats = signal<KpiStat[]>([
    {
      title: 'Tenants Activos',
      value: '12',
      change: '+25% este mes',
      isPositive: true,
      icon: 'tenants',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Ingreso Recurrente (MRR)',
      value: 'S/ 8,450',
      change: '+18.2% vs mes anterior',
      isPositive: true,
      icon: 'mrr',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Usuarios Globales',
      value: '148',
      change: '+12 nuevos hoy',
      isPositive: true,
      icon: 'users',
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400',
    },
    {
      title: 'Salud de Plataforma',
      value: '99.98%',
      change: 'Uptime excelente',
      isPositive: true,
      icon: 'uptime',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
  ]);

  ngOnInit(): void {
    this.loadRecentTenants();
  }

  private loadRecentTenants(): void {
    this.isLoading.set(true);
    this.tenantApiService.getTenants(1, 5, '').subscribe({
      next: (result) => {
        this.recentTenants.set(result.items);
        this.totalTenantsCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
