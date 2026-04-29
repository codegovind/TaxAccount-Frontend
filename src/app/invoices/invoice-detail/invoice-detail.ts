import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { InvoiceResponse } from '../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.scss'
})
export class InvoiceDetailComponent implements OnInit {
  invoice = signal<InvoiceResponse | null>(null);
  isLoading = signal(true);
  isUpdating = signal(false);
  userName = signal('');
  //userRole = signal('');

  statusOptions = [
    { value: 1, label: 'Draft' },
    { value: 2, label: 'Sent' },
    { value: 3, label: 'Paid' },
    { value: 4, label: 'Cancelled' }
  ];

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.fullName || '');
    //this.userRole.set(user?.role || '');

    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadInvoice(+id);
  }

  loadInvoice(id: number): void {
    this.invoiceService.getById(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/invoices']);
      }
    });
  }

  updateStatus(status: number): void {
    const inv = this.invoice();
    if (!inv) return;

    this.isUpdating.set(true);
    this.invoiceService.updateStatus(inv.id, status).subscribe({
      next: (updated) => {
        this.invoice.set(updated);
        this.isUpdating.set(false);
      },
      error: () => this.isUpdating.set(false)
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'sent': return 'status-sent';
      case 'draft': return 'status-draft';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/auth/login']);
  // }
}