import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AccountingService } from '../../accounting.service';

interface CashFlowLineItem {
  description: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'total';
}

interface CashFlowSection {
  title: string;
  items: CashFlowLineItem[];
  netAmount: number;
}

interface CashFlowStatement {
  method: 'direct' | 'indirect';
  period: string;
  fromDate: Date;
  toDate: Date;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  openingBalance: number;
  closingBalance: number;
  netChange: number;
}

@Component({
  selector: 'app-cash-flow',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit, OnDestroy {
  cashFlowForm!: FormGroup;
  cashFlowData: CashFlowStatement | null = null;
  loading = false;
  method: 'direct' | 'indirect' = 'direct';
  periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCashFlow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.cashFlowForm = this.fb.group({
      method: ['direct'],
      period: ['monthly'],
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today, Validators.required]
    });

    this.cashFlowForm.get('period')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(period => {
        this.updateDateRange(period);
      });
  }

  updateDateRange(period: string): void {
    const today = new Date();
    let fromDate: Date;
    let toDate = today;

    switch (period) {
      case 'monthly':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        fromDate = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        fromDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    this.cashFlowForm.patchValue({ fromDate, toDate }, { emitEvent: false });
  }

  loadCashFlow(): void {
    this.loading = true;
    const { method, fromDate, toDate } = this.cashFlowForm.value;
    
    this.accountingService.getCashFlow(fromDate, toDate, method)
      .subscribe({
        next: (data) => {
          this.cashFlowData = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading cash flow:', error);
          // Fallback to mock data for demonstration
          this.cashFlowData = this.generateMockCashFlow(method);
          this.loading = false;
        }
      });
  }

  generateMockCashFlow(method: string): CashFlowStatement {
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      method: method as 'direct' | 'indirect',
      period: 'Monthly',
      fromDate,
      toDate: today,
      operatingActivities: {
        title: 'Cash Flow from Operating Activities',
        items: method === 'direct' ? [
          { description: 'Cash Receipts from Customers', amount: 50000, type: 'inflow' },
          { description: 'Cash Paid to Suppliers', amount: -30000, type: 'outflow' },
          { description: 'Cash Paid for Expenses', amount: -10000, type: 'outflow' }
        ] : [
          { description: 'Net Income', amount: 15000, type: 'inflow' },
          { description: 'Depreciation', amount: 2000, type: 'inflow' },
          { description: 'Increase in Accounts Receivable', amount: -3000, type: 'outflow' },
          { description: 'Decrease in Inventory', amount: 1500, type: 'inflow' },
          { description: 'Increase in Accounts Payable', amount: 2500, type: 'inflow' }
        ],
        netAmount: method === 'direct' ? 10000 : 18000
      },
      investingActivities: {
        title: 'Cash Flow from Investing Activities',
        items: [
          { description: 'Purchase of Equipment', amount: -15000, type: 'outflow' },
          { description: 'Sale of Investments', amount: 5000, type: 'inflow' }
        ],
        netAmount: -10000
      },
      financingActivities: {
        title: 'Cash Flow from Financing Activities',
        items: [
          { description: 'Proceeds from Loan', amount: 20000, type: 'inflow' },
          { description: 'Repayment of Loan', amount: -5000, type: 'outflow' },
          { description: 'Capital Introduced', amount: 10000, type: 'inflow' }
        ],
        netAmount: 25000
      },
      openingBalance: 5000,
      closingBalance: 30000,
      netChange: 25000
    };
  }

  onSubmit(): void {
    if (this.cashFlowForm.valid) {
      this.loadCashFlow();
    }
  }

  toggleMethod(): void {
    this.method = this.method === 'direct' ? 'indirect' : 'direct';
    this.cashFlowForm.patchValue({ method: this.method });
    this.loadCashFlow();
  }

  exportToExcel(): void {
    console.log('Export to Excel');
  }

  exportToPDF(): void {
    console.log('Export to PDF');
  }

  printReport(): void {
    window.print();
  }

  getAmountClass(amount: number): string {
    if (amount > 0) return 'inflow';
    if (amount < 0) return 'outflow';
    return 'total';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  }
}
