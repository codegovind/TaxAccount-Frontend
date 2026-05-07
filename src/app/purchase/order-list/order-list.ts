import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseService } from '../../core/services/purchase.service';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseOrderResponseDto } from '../../core/models/purchase.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class OrderListComponent implements OnInit {
  orders = signal<PurchaseOrderResponseDto[]>([]);
  isLoading = signal(true);

  statusOptions = [
    { value: 1, label: 'Draft' },
    { value: 2, label: 'Sent' },
    { value: 3, label: 'Received' },
    { value: 4, label: 'Cancelled' }
  ];

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.purchaseService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateStatus(orderId: number, status: number): void {
    this.purchaseService.updateOrderStatus(orderId, status)
      .subscribe({
        next: () => this.loadOrders(),
        error: (err) =>
          alert(err.error?.message || 'Status update failed')
      });
  }

  convertToBill(orderId: number): void {
    if (!confirm(
      'Convert this order to a purchase bill? ' +
      'Stock will be updated.')) return;

    this.purchaseService.convertOrderToBill(orderId).subscribe({
      next: (bill) => {
        this.loadOrders();
        this.router.navigate(['/purchase', bill.id]);
      },
      error: (err) =>
        alert(err.error?.message || 'Conversion failed')
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'sent': return 'status-sent';
      case 'received': return 'status-paid';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-draft';
    }
  }

  canConvert(status: string): boolean {
    return status !== 'Cancelled' && status !== 'Received';
  }

  hasPermission(p: string): boolean {
    return this.authService.hasPermission(p);
  }

  getPendingCount(): number {
    return this.orders().filter(o =>
      o.status !== 'Cancelled' && o.status !== 'Received').length;
  }
}