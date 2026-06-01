import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-expense-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './expense-create.component.html',
  styleUrls: ['./expense-create.component.scss']
})
export class ExpenseCreateComponent {
  expenseForm = {
    id: 0,
    date: new Date().toISOString().split('T')[0],
    categoryId: 1,
    description: '',
    amount: 0,
    gstRate: 18,
    paymentMode: 'Cash',
    referenceNumber: '',
    notes: ''
  };

  isEditMode = false;
  saving = false;

  categories = [
    { id: 1, name: 'Office Expenses' },
    { id: 2, name: 'Travel' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Utilities' },
    { id: 5, name: 'Rent' },
    { id: 6, name: 'Professional Fees' },
    { id: 7, name: 'Maintenance' },
    { id: 8, name: 'Other' }
  ];
  paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'];
  gstRates = [0, 5, 12, 18, 28];

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ExpenseCreateComponent>);
  private data = inject<any>(MAT_DIALOG_DATA);

  constructor() {
    if (this.data) {
      this.isEditMode = true;
      this.expenseForm = {
        id: this.data.id,
        date: this.data.date.split('T')[0],
        categoryId: this.data.categoryId,
        description: this.data.description,
        amount: this.data.amount,
        gstRate: this.data.gstRate || 18,
        paymentMode: this.data.paymentMode,
        referenceNumber: this.data.referenceNumber || '',
        notes: this.data.notes || ''
      };
    }
  }

  calculateTotal(): number {
    const gstAmount = (this.expenseForm.amount * this.expenseForm.gstRate) / 100;
    return this.expenseForm.amount + gstAmount;
  }

  save(): void {
    if (!this.expenseForm.description || !this.expenseForm.amount) {
      this.snackBar.open('Please fill required fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    const apiUrl = `${environment.apiUrl}/api/expense`;

    const request$ = this.isEditMode
      ? this.http.put(`${apiUrl}/${this.expenseForm.id}`, this.expenseForm)
      : this.http.post(apiUrl, this.expenseForm);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Expense updated successfully' : 'Expense created successfully', 'Close', { duration: 3000 });
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving expense:', error);
        this.snackBar.open('Failed to save expense', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
