import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountingService } from '../accounting.service';
import { AccountHead } from '../accounting.models';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Chart of Accounts</h2>
        <button (click)="openAddModal()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i>Add Account
        </button>
      </div>

      <div class="card">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-gray-50">
            <tr>
              <th class="px-6 py-3">Code</th>
              <th class="px-6 py-3">Account Name</th>
              <th class="px-6 py-3">Type</th>
              <th class="px-6 py-3">Opening Balance</th>
              <th class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (account of accounts(); track account.id) {
              <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium">{{ account.code }}</td>
                <td class="px-6 py-4">{{ account.name }}</td>
                <td class="px-6 py-4">{{ account.type }}</td>
                <td class="px-6 py-4">{{ account.openingBalance | currency:'INR' }}</td>
                <td class="px-6 py-4">
                  <button (click)="editAccount(account)" class="text-blue-600 hover:underline mr-2">Edit</button>
                  <button (click)="deleteAccount(account.id)" class="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class ChartOfAccountsComponent implements OnInit {
  accounts = signal<AccountHead[]>([]);

  constructor(private accountingService: AccountingService) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountingService.getChartOfAccounts().subscribe({
      next: (data) => this.accounts.set(data),
      error: (err) => console.error('Error loading accounts', err)
    });
  }

  openAddModal() {
    // Implement modal logic
  }

  editAccount(account: AccountHead) {
    // Implement edit logic
  }

  deleteAccount(id: number) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountingService.deleteAccount(id).subscribe({
        next: () => this.loadAccounts(),
        error: (err: any) => console.error('Error deleting account', err)
      });
    }
  }
}
