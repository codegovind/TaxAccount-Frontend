import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountingService } from '../accounting.service';
import { LedgerEntry } from '../accounting.models';

@Component({
  selector: 'app-general-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">General Ledger</h2>
      
      <!-- Filters -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">From Date</label>
            <input type="date" [(ngModel)]="fromDate" class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">To Date</label>
            <input type="date" [(ngModel)]="toDate" class="w-full p-2 border rounded" />
          </div>
          <div class="flex items-end">
            <button (click)="loadLedger()" class="btn-primary w-full">
              <i class="pi pi-search mr-2"></i>Search
            </button>
          </div>
        </div>
      </div>

      <!-- Ledger Entries -->
      <div class="card overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Voucher Type</th>
              <th class="px-4 py-3">Voucher No</th>
              <th class="px-4 py-3">Particulars</th>
              <th class="px-4 py-3">Debit</th>
              <th class="px-4 py-3">Credit</th>
              <th class="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of ledgerEntries(); track entry.id) {
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">{{ entry.date | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3">{{ entry.voucherType }}</td>
                <td class="px-4 py-3 font-medium">{{ entry.voucherNumber }}</td>
                <td class="px-4 py-3">{{ entry.narration }}</td>
                <td class="px-4 py-3 text-right">{{ entry.debit | currency:'INR' }}</td>
                <td class="px-4 py-3 text-right">{{ entry.credit | currency:'INR' }}</td>
                <td class="px-4 py-3 text-right font-bold">{{ getBalance(entry) | currency:'INR' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">No ledger entries found</td>
              </tr>
            }
          </tbody>
          @if (ledgerEntries().length > 0) {
            <tfoot class="bg-gray-100 font-bold">
              <tr>
                <td colspan="4" class="px-4 py-3 text-right">Total</td>
                <td class="px-4 py-3 text-right">{{ totalDebit() | currency:'INR' }}</td>
                <td class="px-4 py-3 text-right">{{ totalCredit() | currency:'INR' }}</td>
                <td class="px-4 py-3 text-right">{{ closingBalance() | currency:'INR' }}</td>
              </tr>
            </tfoot>
          }
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class GeneralLedgerComponent implements OnInit {
  ledgerEntries = signal<LedgerEntry[]>([]);
  fromDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  toDate = new Date().toISOString().split('T')[0];
  runningBalance = 0;

  constructor(private accountingService: AccountingService) {}

  ngOnInit() {
    this.loadLedger();
  }

  loadLedger() {
    this.accountingService.getGeneralLedger(this.fromDate, this.toDate).subscribe({
      next: (data: LedgerEntry[]) => {
        this.ledgerEntries.set(data);
        this.runningBalance = 0;
      },
      error: (err: any) => console.error('Error loading ledger', err)
    });
  }

  getBalance(entry: LedgerEntry): number {
    this.runningBalance += entry.debit - entry.credit;
    return this.runningBalance;
  }

  totalDebit(): number {
    return this.ledgerEntries().reduce((sum, e) => sum + e.debit, 0);
  }

  totalCredit(): number {
    return this.ledgerEntries().reduce((sum, e) => sum + e.credit, 0);
  }

  closingBalance(): number {
    return this.totalDebit() - this.totalCredit();
  }
}
