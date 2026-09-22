import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import {
  PageHeroCardComponent,
  PageHeroConfig,
  MetricsBentoGridComponent,
  MetricCardConfig,
  QuickFilterBarComponent,
  QuickFilterTab,
  NotificationService,
} from '@nalunpos/shared/ui';
import { PurchaseOrder, PurchaseOrderStatus } from '../../interfaces/purchase-order.interface';
import { PurchaseOrderApiService } from '../../services/purchase-order-api.service';
import { PurchaseOrderCreateComponent } from '../purchase-order-create/purchase-order-create.component';
import { PurchaseOrderReceiveComponent } from '../purchase-order-receive/purchase-order-receive.component';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    PageHeroCardComponent,
    MetricsBentoGridComponent,
    QuickFilterBarComponent,
  ],
  templateUrl: './purchase-order-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderListComponent implements OnInit {
  private readonly purchaseOrderApi = inject(PurchaseOrderApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  // ── Estado ──
  protected readonly orders = signal<PurchaseOrder[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ── Filtros y Paginación ──
  protected readonly activeFilter = signal<string>('all'); // all | 0 | 1 | 2 | 3
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(20);

  protected readonly displayedColumns = [
    'orden',
    'proveedor',
    'total',
    'lineas',
    'estado',
    'acciones',
  ];

  // ── Tabs Quick Filter ──
  protected readonly filterTabs = computed<QuickFilterTab[]>(() => [
    { key: 'all', label: 'Todas' },
    { key: '0', label: 'Borrador' },
    { key: '1', label: 'Enviadas' },
    { key: '2', label: 'Parciales' },
    { key: '3', label: 'Recibidas' },
  ]);

  // ── Hero Config ──
  protected readonly heroConfig: PageHeroConfig = {
    badge: 'MÓDULO DE COMPRAS • GESTIÓN DE ÓRDENES',
    title: 'Órdenes de',
    titleHighlight: 'Compra',
    description:
      'Gestione y monitoree el ciclo completo de aprovisionamiento: desde borrador hasta recepción total en almacén.',
    imageUrl:
      'https://res.cloudinary.com/dmy8wn3vg/image/upload/v1789483543082/inventory_hero_1790003866378_yscqbn.png',
    primaryAction: { label: 'Nueva Orden' },
  };

  // ── Métricas ──
  protected readonly draftCount = computed(
    () => this.orders().filter((o) => o.status === PurchaseOrderStatus.Draft).length
  );
  protected readonly sentCount = computed(
    () => this.orders().filter((o) => o.status === PurchaseOrderStatus.Sent).length
  );
  protected readonly receivedCount = computed(
    () => this.orders().filter((o) => o.status === PurchaseOrderStatus.FullyReceived).length
  );

  protected readonly metricsCards = computed<MetricCardConfig[]>(() => [
    {
      label: 'Total Órdenes',
      value: this.orders().length,
      badge: 'Registradas',
      topIndicator: '🛒',
      progressPercent: 100,
      colorVariant: 'cobalt',
    },
    {
      label: 'En Borrador',
      value: this.draftCount(),
      badge: 'Pendientes envío',
      topIndicator: '📝',
      progressPercent:
        this.orders().length > 0
          ? Math.round((this.draftCount() / this.orders().length) * 100)
          : 0,
      colorVariant: 'purple',
    },
    {
      label: 'En Tránsito / Enviadas',
      value: this.sentCount(),
      badge: 'Por recibir',
      badgeHasArrow: true,
      topIndicator: '🚚',
      progressPercent:
        this.orders().length > 0
          ? Math.round((this.sentCount() / this.orders().length) * 100)
          : 0,
      colorVariant: 'orchid',
    },
    {
      label: 'Recibidas',
      value: this.receivedCount(),
      badge: 'Completo',
      topIndicator: '✓',
      topIndicatorIsCheck: true,
      progressPercent:
        this.orders().length > 0
          ? Math.round((this.receivedCount() / this.orders().length) * 100)
          : 0,
      colorVariant: 'cobalt',
    },
  ]);

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const statusEnum =
      this.activeFilter() !== 'all'
        ? (Number(this.activeFilter()) as PurchaseOrderStatus)
        : undefined;

    this.purchaseOrderApi
      .getPurchaseOrders(this.pageIndex() + 1, this.pageSize(), statusEnum)
      .subscribe({
        next: (items) => {
          this.orders.set(items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('No se pudieron cargar las órdenes de compra.');
          this.notification.error('Error al conectar con el servidor.', 'Error');
        },
      });
  }

  protected onFilterChange(tabId: string): void {
    this.activeFilter.set(tabId);
    this.pageIndex.set(0);
    this.loadOrders();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOrders();
  }

  protected openCreateDialog(): void {
    const ref = this.dialog.open(PurchaseOrderCreateComponent, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
    });

    ref.afterClosed().subscribe((created: boolean) => {
      if (created) this.loadOrders();
    });
  }

  protected openReceiveDialog(order: PurchaseOrder): void {
    const ref = this.dialog.open(PurchaseOrderReceiveComponent, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: 'dark-dialog-panel',
      disableClose: true,
      data: { order },
    });

    ref.afterClosed().subscribe((received: boolean) => {
      if (received) this.loadOrders();
    });
  }

  protected onSendOrder(order: PurchaseOrder): void {
    if (confirm(`¿Desea enviar formalmente la Orden ${order.orderNumber} al proveedor?`)) {
      this.purchaseOrderApi.sendPurchaseOrder(order.id).subscribe({
        next: () => {
          this.notification.success(`Orden ${order.orderNumber} enviada al proveedor.`, 'Éxito');
          this.loadOrders();
        },
        error: (err) => {
          this.notification.error(err?.error?.detail || 'No se pudo enviar la orden.', 'Error');
        },
      });
    }
  }

  protected getStatusBadge(status: PurchaseOrderStatus): { label: string; class: string } {
    switch (status) {
      case PurchaseOrderStatus.Draft:
        return {
          label: 'Borrador',
          class: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      case PurchaseOrderStatus.Sent:
        return {
          label: 'Enviada / En Tránsito',
          class: 'bg-[#EEF5FE] text-[#2A5BC7] border-[#92AAE7]',
        };
      case PurchaseOrderStatus.PartiallyReceived:
        return {
          label: 'Parcialmente Recibida',
          class: 'bg-[#FFF9EC] text-[#9A6800] border-[#F3D677]',
        };
      case PurchaseOrderStatus.FullyReceived:
        return {
          label: 'Recibida',
          class: 'bg-[#ECFDF5] text-[#059669] border-[#6EE7B7]',
        };
      case PurchaseOrderStatus.Cancelled:
        return {
          label: 'Cancelada',
          class: 'bg-[#FDF2F7] text-[#9B2C67] border-[#E8A0BF]',
        };
      default:
        return {
          label: 'Desconocido',
          class: 'bg-gray-100 text-gray-600 border-gray-200',
        };
    }
  }
}
