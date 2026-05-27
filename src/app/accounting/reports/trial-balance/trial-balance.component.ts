import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Trial Balance</h2>

      <div class="mb-4 flex gap-4">
        <div>
          <label class="block text-sm font-medium">From Date</label>
          <input type="date" [(ngModel)]="fromDate" class="border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">To Date</label>
          <input type="date" [(ngModel)]="toDate" class="border rounded p-2" />
        </div>
        <div class="flex items-end">
          <button (click)="loadTrialBalance()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Generate
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-8">Loading...</div>

      <div *ngIf="!loading && items.length > 0" class="overflow-x-auto">
        <table class="min-w-full bg-white border">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 border text-left">Account Code</th>
              <th class="px-4 py-2 border text-left">Account Name</th>
              <th class="px-4 py-2 border text-right">Opening Debit</th>
              <th class="px-4 py-2 border text-right">Opening Credit</th>
              <th class="px-4 py-2 border text-right">Current Debit</th>
              <th class="px-4 py-2 border text-right">Current Credit</th>
              <th class="px-4 py-2 border text-right">Closing Debit</th>
              <th class="px-4 py-2 border text-right">Closing Credit</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items" class="hover:bg-gray-50">
              <td class="px-4 py-2 border">{{ item.accountCode }}</td>
              <td class="px-4 py-2 border">{{ item.accountName }}</td>
              <td class="px-4 py-2 border text-right">{{ item.openingDebit | currency:'INR':'symbol':'1.2-2' }}</td>
              <td class="px-4 py-2 border text-right">{{ item.openingCredit | currency:'INR':'symbol':'1.2-2' }}</td>
              <td class="px-4 py-2 border text-right">{{ item.currentDebit | currency:'INR':'symbol':'1.2-2' }}</td>
              <td class="px-4 py-2 border text-right">{{ item.currentCredit | currency:'INR':'symbol':'1.2-2' }}</td>
              <td class="px-4 py-2 border text-right font-semibold">{{ item.closingDebit | currency:'INR':'symbol':'1.2-2' }}</td>
              <td class="px-4 py-2 border text-right font-semibold">{{ item.closingCredit | currency:'INR':'symbol':'1.2-2' }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-100 font-bold">
            <tr>
              <td colspan="2" class="px-4 py-2 border">TOTAL</td>
              <td class="px-4 py-2 border text-right"></td>
              <td class="px-4 py-2 border text-right"></td>
              <td class="px-4 py-2 border text-right"></td>
              <td class="px-4 py-2 border text-right"></td>
              <td class="px-4 py-2 border text-right">{{ totalDebit | currency:'INR':'symbol':'1.2-2' }}</td>
              <td class="px-4 py-2 border text-right">{{ totalCredit | currency:'INR':'symbol':'1.2-2' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div *ngIf="!loading && items.length === 0" class="text-center py-8 text-gray-500">
        No data found. Click Generate to view trial balance.
      </div>
    </div>
  `,
  styles: []
})
export class TrialBalanceComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  items: any[] = [];
  totalDebit: number = 0;
  totalCredit: number = 0;
  loading: boolean = false;

  constructor(private accountingService: AccountingService) {}

  ngOnInit(): void {
    const today = new Date();
    this.fromDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
    this.loadTrialBalance();
  }

  loadTrialBalance(): void {
    if (!this.fromDate || !this.toDate) return;

    this.loading = true;
    this.accountingService.getTrialBalance(this.fromDate, this.toDate).subscribe({
      next: (data: any) => {
        this.items = data.items;
        this.totalDebit = data.totalDebit;
        this.totalCredit = data.totalCredit;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading trial balance', err);
        this.loading = false;
      }
    });
  }
}
