import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceResponse } from '../../core/models/invoice.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss'
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceResponse[]>([]);
  isLoading = signal(true);
  userName = signal('');
  //userRole = signal('');

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.fullName || '');
    //this.userRole.set(user?.role || '');
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoiceService.getAll().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  viewInvoice(id: number): void {
    this.router.navigate(['/invoices', id]);
  }

  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/auth/login']);
  // }

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
}