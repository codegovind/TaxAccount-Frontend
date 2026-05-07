import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../../core/services/purchase.service';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseBillResponseDto } from '../../core/models/purchase.model';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-detail.html',
  styleUrl: './purchase-detail.scss'
})
export class PurchaseDetailComponent implements OnInit {
  bill = signal<PurchaseBillResponseDto | null>(null);
  isLoading = signal(true);
  isDeleting = signal(false);

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadBill(+id);
  }

  loadBill(id: number): void {
    this.purchaseService.getBillById(id).subscribe({
      next: (data) => {
        this.bill.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/purchase']);
      }
    });
  }

  deleteBill(): void {
    if (!confirm(
      'Delete this purchase bill? Stock will be reversed.')) return;

    this.isDeleting.set(true);
    this.purchaseService.deleteBill(this.bill()!.id).subscribe({
      next: () => this.router.navigate(['/purchase']),
      error: (err) => {
        alert(err.error?.message || 'Delete failed');
        this.isDeleting.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'sent': return 'status-sent';
      case 'draft': return 'status-draft';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-draft';
    }
  }

  hasPermission(p: string): boolean {
    return this.authService.hasPermission(p);
  }

  getTotalCgst(): number {
    return this.bill()?.items
      .reduce((sum, i) => sum + i.cgstAmount, 0) ?? 0;
  }

  getTotalSgst(): number {
    return this.bill()?.items
      .reduce((sum, i) => sum + i.sgstAmount, 0) ?? 0;
  }

  getTotalIgst(): number {
    return this.bill()?.items
      .reduce((sum, i) => sum + i.igstAmount, 0) ?? 0;
  }
}