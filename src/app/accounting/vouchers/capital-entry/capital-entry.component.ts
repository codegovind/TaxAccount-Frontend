import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountingService, AccountHead } from '../../../core/services/accounting.service';
import { TallyShortcutsDirective } from '../../../shared/directives/tally-shortcuts.directive';

interface CapitalEntryRow {
  id: number;
  accountHeadId: number | null;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  narration: string;
}

@Component({
  selector: 'app-capital-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatButtonToggleModule,
    TallyShortcutsDirective
  ],
  templateUrl: './capital-entry.component.html',
  styleUrls: ['./capital-entry.component.css']
})
export class CapitalEntryComponent implements OnInit, OnDestroy {
  entryType: 'Capital' | 'Drawings' = 'Capital';
  rows: CapitalEntryRow[] = [];
  totalDebit: number = 0;
  totalCredit: number = 0;
  difference: number = 0;
  isBalanced: boolean = true;
  date: string = new Date().toISOString().split('T')[0];
  referenceNo: string = '';
  narration: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private accountingService: AccountingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addRow();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onShortcut(shortcut: string): void {
    switch (shortcut) {
      case 'CAPITAL_VOUCHER':
        this.newEntry();
        break;
      case 'SAVE':
        this.saveEntry();
        break;
      case 'CANCEL':
        this.cancel();
        break;
    }
  }

  toggleEntryType(): void {
    this.entryType = this.entryType === 'Capital' ? 'Drawings' : 'Capital';
  }

  addRow(): void {
    const newRow: CapitalEntryRow = {
      id: Date.now(),
      accountHeadId: null,
      accountName: '',
      debitAmount: 0,
      creditAmount: 0,
      narration: ''
    };
    this.rows.push(newRow);
  }

  removeRow(rowId: number): void {
    if (this.rows.length > 1) {
      this.rows = this.rows.filter(r => r.id !== rowId);
      this.calculateTotals();
    }
  }

  onAccountSelect(row: CapitalEntryRow, accountName: string, accountId: number): void {
    row.accountName = accountName;
    row.accountHeadId = accountId;
  }

  calculateTotals(): void {
    this.totalDebit = this.rows.reduce((sum, row) => sum + (row.debitAmount || 0), 0);
    this.totalCredit = this.rows.reduce((sum, row) => sum + (row.creditAmount || 0), 0);
    this.difference = Math.abs(this.totalDebit - this.totalCredit);
    this.isBalanced = this.totalDebit === this.totalCredit;
  }

  searchAccounts(query: string): Promise<{id: number, name: string, type: number}[]> {
    return new Promise((resolve) => {
      if (!query || query.length < 2) {
        resolve([]);
        return;
      }
      
      const sub = this.accountingService.getChartOfAccounts().subscribe({
        next: (accounts: AccountHead[]) => {
          const filtered = accounts
            .filter((a: AccountHead) => a.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
            .map((a: AccountHead) => ({ id: a.id, name: a.name, type: a.type }));
          resolve(filtered);
          sub.unsubscribe();
        },
        error: () => {
          resolve([]);
        }
      });
    });
  }

  async onSearchInput(row: CapitalEntryRow, event: Event): Promise<void> {
    const query = (event.target as HTMLInputElement).value;
    if (query.length >= 2) {
      const results = await this.searchAccounts(query);
      if (results.length === 1) {
        this.onAccountSelect(row, results[0].name, results[0].id);
      }
    }
  }

  saveEntry(): void {
    if (!this.isBalanced) {
      alert('Entry must be balanced before saving!');
      return;
    }

    if (this.rows.some(r => !r.accountHeadId || (r.debitAmount === 0 && r.creditAmount === 0))) {
      alert('Please fill all required fields!');
      return;
    }

    const voucherData = {
      voucherType: this.entryType === 'Capital' ? 'Capital' : 'Drawings',
      date: this.date,
      referenceNo: this.referenceNo,
      entries: this.rows.map(row => ({
        accountHeadId: row.accountHeadId!,
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
        narration: row.narration || this.narration
      })),
      totalAmount: this.totalDebit,
      narration: this.narration
    };

    console.log('Saving Capital Entry:', voucherData);
    
    // TODO: Call API to save voucher
    alert('Capital Entry saved successfully! (Demo mode)');
    this.router.navigate(['/accounting/vouchers']);
  }

  newEntry(): void {
    if (confirm('Discard current entry and start new?')) {
      this.resetForm();
    }
  }

  cancel(): void {
    if (confirm('Discard unsaved changes?')) {
      this.router.navigate(['/accounting/vouchers']);
    }
  }

  resetForm(): void {
    this.rows = [];
    this.totalDebit = 0;
    this.totalCredit = 0;
    this.difference = 0;
    this.isBalanced = true;
    this.date = new Date().toISOString().split('T')[0];
    this.referenceNo = '';
    this.narration = '';
    this.addRow();
  }
}
