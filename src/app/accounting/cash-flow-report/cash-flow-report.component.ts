import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { CashFlowService } from '../../core/services/cash-flow.service';

interface CashFlowData {
  month: string;
  openingBalance: number;
  cashInflows: number;
  cashOutflows: number;
  closingBalance: number;
  netChange: number;
}

@Component({
  selector: 'app-cash-flow-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './cash-flow-report.component.html',
  styleUrls: ['./cash-flow-report.component.scss']
})
export class CashFlowReportComponent implements OnInit {
  year = signal<string>(new Date().getFullYear().toString());
  availableYears = signal<string[]>([]);
  isLoading = signal<boolean>(false);
  cashFlowData = signal<CashFlowData[]>([]);
  totalOpeningBalance = signal<number>(0);
  totalCashInflows = signal<number>(0);
  totalCashOutflows = signal<number>(0);
  totalClosingBalance = signal<number>(0);
  totalNetChange = signal<number>(0);

  displayedColumns: string[] = ['month', 'openingBalance', 'cashInflows', 'cashOutflows', 'netChange', 'closingBalance'];

  constructor(private cashFlowService: CashFlowService) {}

  ngOnInit(): void {
    this.loadAvailableYears();
    this.loadCashFlowData();
  }

  loadAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i.toString());
    }
    this.availableYears.set(years);
  }

  loadCashFlowData(): void {
    this.isLoading.set(true);
    this.cashFlowService.getCashFlow(this.year()).subscribe({
      next: (data) => {
        this.cashFlowData.set(data.monthlyData || []);
        this.calculateTotals();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading cash flow data:', error);
        this.isLoading.set(false);
      }
    });
  }

  onYearChange(): void {
    this.loadCashFlowData();
  }

  calculateTotals(): void {
    const data = this.cashFlowData();
    if (data.length === 0) {
      this.totalOpeningBalance.set(0);
      this.totalCashInflows.set(0);
      this.totalCashOutflows.set(0);
      this.totalClosingBalance.set(0);
      this.totalNetChange.set(0);
      return;
    }

    this.totalOpeningBalance.set(data[0].openingBalance);
    this.totalCashInflows.set(data.reduce((sum, item) => sum + item.cashInflows, 0));
    this.totalCashOutflows.set(data.reduce((sum, item) => sum + item.cashOutflows, 0));
    this.totalNetChange.set(data.reduce((sum, item) => sum + item.netChange, 0));
    this.totalClosingBalance.set(data[data.length - 1].closingBalance);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  getNetChangeClass(netChange: number): string {
    return netChange >= 0 ? 'positive' : 'negative';
  }
}
