import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material/core';
import { PaymentService } from '../../core/services/payment.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Payment {
  id?: number;
  paymentNumber?: string;
  date: string;
  amount: number;
  type: 'Receipt' | 'Payment';
  status: 'Completed' | 'Pending' | 'Cancelled';
  referenceType: 'Invoice' | 'PurchaseBill' | 'Expense';
  referenceId?: number;
  contactId?: number;
  description?: string;
  paymentMethod: 'Cash' | 'Bank' | 'UPI' | 'Cheque';
  bankName?: string;
  transactionId?: string;
  notes?: string;
}

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.scss']
})
export class PaymentCreateComponent implements OnInit {
  payment = signal<Payment>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'Payment',
    status: 'Completed',
    referenceType: 'Invoice',
    paymentMethod: 'Bank',
    description: '',
    notes: ''
  });

  loading = signal(false);
  isEditMode = false;

  referenceTypes = ['Invoice', 'PurchaseBill', 'Expense'];
  paymentMethods = ['Cash', 'Bank', 'UPI', 'Cheque'];
  statuses = ['Completed', 'Pending', 'Cancelled'];
  types = ['Receipt', 'Payment'];

  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PaymentCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; payment?: Payment }
  ) {}

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.payment) {
      this.isEditMode = true;
      this.payment.set({ ...this.data.payment });
    }
  }

  save(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);

    if (this.isEditMode && this.payment().id) {
      this.paymentService.updatePayment(this.payment().id!, this.payment()).subscribe({
        next: () => {
          this.snackBar.open('Payment updated successfully', 'Close', { duration: 3000 });
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating payment:', error);
          this.loading.set(false);
          this.snackBar.open('Failed to update payment', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.paymentService.createPayment(this.payment()).subscribe({
        next: () => {
          this.snackBar.open('Payment created successfully', 'Close', { duration: 3000 });
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.loading.set(false);
          this.snackBar.open('Failed to create payment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.payment().date) {
      this.snackBar.open('Please select a date', 'Close', { duration: 3000 });
      return false;
    }

    if (!this.payment().amount || this.payment().amount <= 0) {
      this.snackBar.open('Please enter a valid amount', 'Close', { duration: 3000 });
      return false;
    }

    return true;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
