import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RecurringVoucherService } from '../../core/services/recurring-voucher.service';
import { RecurringVoucher } from '../../core/models/recurring-voucher.model';

interface RecurringVoucherDisplay extends RecurringVoucher {
  nextExecutionDate?: string;
  statusBadge: 'active' | 'paused' | 'completed';
}

@Component({
  selector: 'app-recurring-voucher-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './recurring-voucher-list.component.html',
  styleUrls: ['./recurring-voucher-list.component.scss']
})
export class RecurringVoucherListComponent implements OnInit {
  vouchers = signal<RecurringVoucherDisplay[]>([]);
  isLoading = signal(false);
  displayedColumns: string[] = ['name', 'type', 'frequency', 'nextExecution', 'status', 'actions'];

  frequencyFilter = '';
  statusFilter = '';

  constructor(
    private recurringVoucherService: RecurringVoucherService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.isLoading.set(true);
    this.recurringVoucherService.getAll().subscribe({
      next: (data) => {
        this.vouchers.set(data.map(v => ({
          ...v,
          nextExecutionDate: this.calculateNextExecution(v),
          statusBadge: v.isActive ? 'active' : 'paused'
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('Failed to load recurring vouchers', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  calculateNextExecution(voucher: RecurringVoucher): string {
    if (!voucher.isActive || !voucher.startDate) return 'N/A';
    
    const start = new Date(voucher.startDate);
    const now = new Date();
    let next = new Date(start);

    while (next < now) {
      switch (voucher.frequency) {
        case 'Daily':
          next.setDate(next.getDate() + 1);
          break;
        case 'Weekly':
          next.setDate(next.getDate() + 7);
          break;
        case 'Monthly':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'Quarterly':
          next.setMonth(next.getMonth() + 3);
          break;
        case 'Yearly':
          next.setFullYear(next.getFullYear() + 1);
          break;
      }
    }

    return next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  executeNow(id: string): void {
    if (!confirm('Execute this voucher template now? This will create a new voucher.')) return;

    this.recurringVoucherService.executeNow(id).subscribe({
      next: (response) => {
        this.snackBar.open(`Voucher executed successfully! Generated: ${response.voucherNumber}`, 'Close', { duration: 4000 });
        this.loadVouchers();
      },
      error: (err) => {
        this.snackBar.open('Failed to execute voucher', 'Close', { duration: 3000 });
      }
    });
  }

  toggleStatus(id: string, currentStatus: boolean): void {
    const action = currentStatus ? 'pause' : 'resume';
    if (!confirm(`Are you sure you want to ${action} this template?`)) return;

    this.recurringVoucherService.updateStatus(id, !currentStatus).subscribe({
      next: () => {
        this.snackBar.open(`Template ${action}d successfully`, 'Close', { duration: 3000 });
        this.loadVouchers();
      },
      error: (err) => {
        this.snackBar.open(`Failed to ${action} template`, 'Close', { duration: 3000 });
      }
    });
  }

  viewLogs(id: string): void {
    this.router.navigate(['/accounting/recurring-vouchers', id, 'logs']);
  }

  editVoucher(id: string): void {
    this.router.navigate(['/accounting/recurring-vouchers', id, 'edit']);
  }

  deleteVoucher(id: string): void {
    if (!confirm('Are you sure you want to delete this template? This cannot be undone.')) return;

    this.recurringVoucherService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Template deleted successfully', 'Close', { duration: 3000 });
        this.loadVouchers();
      },
      error: (err) => {
        this.snackBar.open('Failed to delete template', 'Close', { duration: 3000 });
      }
    });
  }

  getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}
