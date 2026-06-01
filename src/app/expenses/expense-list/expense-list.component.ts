import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ExpenseCreateComponent } from '../expense-create/expense-create.component';

interface Expense {
  id?: number;
  date: string;
  categoryId: number;
  description: string;
  amount: number;
  gstRate: number;
  paymentMode: string;
  referenceNumber: string;
  notes?: string;
}

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses = signal<Expense[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');
  
  displayedColumns: string[] = ['date', 'category', 'description', 'amount', 'total', 'paymentMode', 'actions'];
  
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

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.loading.set(true);
    const apiUrl = `${environment.apiUrl}/api/expense`;
    
    this.http.get<Expense[]>(apiUrl).subscribe({
      next: (data) => {
        this.expenses.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.snackBar.open('Failed to load expenses', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ExpenseCreateComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
      }
    });
  }

  openEditDialog(expense: Expense): void {
    const dialogRef = this.dialog.open(ExpenseCreateComponent, {
      width: '600px',
      data: { ...expense }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
      }
    });
  }

  deleteExpense(id: number): void {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    const apiUrl = `${environment.apiUrl}/api/expense/${id}`;
    
    this.http.delete(apiUrl).subscribe({
      next: () => {
        this.snackBar.open('Expense deleted successfully', 'Close', { duration: 3000 });
        this.loadExpenses();
      },
      error: (error) => {
        console.error('Error deleting expense:', error);
        this.snackBar.open('Failed to delete expense', 'Close', { duration: 3000 });
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getTotalAmount(expense: Expense): number {
    const gstAmount = (expense.amount * expense.gstRate) / 100;
    return expense.amount + gstAmount;
  }

  filterExpenses(): Expense[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.expenses();
    }
    
    return this.expenses().filter(expense => 
      expense.description.toLowerCase().includes(query) ||
      this.getCategoryName(expense.categoryId).toLowerCase().includes(query) ||
      expense.referenceNumber.toLowerCase().includes(query)
    );
  }
}
