import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentCreateComponent } from './payment-create.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Payment {
  id: number;
  paymentNumber: string;
  date: string;
  amount: number;
  type: 'Receipt' | 'Payment';
  status: 'Completed' | 'Pending' | 'Cancelled';
  referenceType: 'Invoice' | 'PurchaseBill' | 'Expense';
  referenceId?: number;
  contactName?: string;
  description?: string;
  paymentMethod: 'Cash' | 'Bank' | 'UPI' | 'Cheque';
  createdAt: string;
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  payments = signal<Payment[]>([]);
  loading = signal(false);
  
  // Filters
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  filterType = signal<string>('all');
  filterStatus = signal<string>('all');

  displayedColumns = ['paymentNumber', 'date', 'contactName', 'type', 'amount', 'status', 'actions'];

  filteredPayments = computed(() => {
    let result = this.payments();
    
    if (this.filterType() !== 'all') {
      result = result.filter(p => p.type === this.filterType());
    }
    
    if (this.filterStatus() !== 'all') {
      result = result.filter(p => p.status === this.filterStatus());
    }
    
    return result;
  });

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load payments', 'Close', { duration: 3000 });
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PaymentCreateComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments();
      }
    });
  }

  editPayment(payment: Payment): void {
    const dialogRef = this.dialog.open(PaymentCreateComponent, {
      width: '600px',
      data: { mode: 'edit', payment }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments();
      }
    });
  }

  deletePayment(id: number): void {
    if (confirm('Are you sure you want to delete this payment?')) {
      this.paymentService.deletePayment(id).subscribe({
        next: () => {
          this.snackBar.open('Payment deleted successfully', 'Close', { duration: 3000 });
          this.loadPayments();
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.snackBar.open('Failed to delete payment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'primary';
      case 'Pending': return 'accent';
      case 'Cancelled': return 'warn';
      default: return 'primary';
    }
  }

  getTypeColor(type: string): string {
    return type === 'Receipt' ? 'primary' : 'accent';
  }
}
