import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountingService, FinancialStatement } from '../../../core/services/accounting.service';
import { FilterByTypePipe } from '../../../shared/pipes/filter-by-type.pipe';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterByTypePipe],
  templateUrl: './balance-sheet.component.html',
  styles: []
})
export class BalanceSheetComponent implements OnInit {
  asOfDate: string = new Date().toISOString().split('T')[0];
  statement: FinancialStatement | null = null;
  loading = false;
  error: string | null = null;

  constructor(private accountingService: AccountingService) {}

  ngOnInit(): void {
    this.loadBalanceSheet();
  }

  loadBalanceSheet(): void {
    this.loading = true;
    this.error = null;
    
    const date = new Date(this.asOfDate);
    this.accountingService.getBalanceSheet(date).subscribe({
      next: (data) => {
        this.statement = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Balance Sheet. Please ensure you have accounting transactions.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDateChange(): void {
    this.loadBalanceSheet();
  }

  calculateTotal(items: any[], type: string): number {
    return items
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  getAssetsTotal(): number {
    return this.calculateTotal(this.statement?.items || [], 'Asset');
  }

  getLiabilitiesTotal(): number {
    return this.calculateTotal(this.statement?.items || [], 'Liability');
  }

  getEquityTotal(): number {
    return this.calculateTotal(this.statement?.items || [], 'Equity');
  }
}
