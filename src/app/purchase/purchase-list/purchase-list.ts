import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseService } from '../../core/services/purchase.service';
import { AuthService } from '../../core/services/auth.service';
import {
  PurchaseBillResponseDto,
  PurchaseOrderResponseDto
} from '../../core/models/purchase.model';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-list.html',
  styleUrl: './purchase-list.scss'
})
export class PurchaseListComponent implements OnInit {
  bills = signal<PurchaseBillResponseDto[]>([]);
  orders = signal<PurchaseOrderResponseDto[]>([]);
  activeTab = signal<'bills' | 'orders'>('bills');
  isLoading = signal(true);

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBills();
    this.loadOrders();
  }

  loadBills(): void {
    this.purchaseService.getAllBills().subscribe({
      next: (data) => {
        this.bills.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadOrders(): void {
    this.purchaseService.getAllOrders().subscribe({
      next: (data) => this.orders.set(data)
    });
  }

  setTab(tab: 'bills' | 'orders'): void {
    this.activeTab.set(tab);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  viewBill(id: number): void {
    this.router.navigate(['/purchase', id]);
  }

  convertToBill(orderId: number): void {
    if (!confirm('Convert this order to a purchase bill?')) return;
    this.purchaseService.convertOrderToBill(orderId).subscribe({
      next: (bill) => {
        this.loadBills();
        this.loadOrders();
        this.router.navigate(['/purchase', bill.id]);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'sent': return 'status-sent';
      case 'draft': return 'status-draft';
      case 'cancelled': return 'status-cancelled';
      case 'received': return 'status-paid';
      default: return 'status-draft';
    }
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  getTotalBillAmount(): number {
    return this.bills().reduce((sum, b) => sum + b.totalAmount, 0);
  }
}