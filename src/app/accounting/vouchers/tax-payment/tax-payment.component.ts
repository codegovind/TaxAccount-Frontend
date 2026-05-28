import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { TallyShortcutsDirective } from '../../../shared/directives/tally-shortcuts.directive';

interface AccountHead {
  id: number;
  name: string;
  group: string;
  type: number; // 0=Asset, 1=Liability, 2=Equity, 3=Income, 4=Expense
  openingBalance: number;
  currentBalance: number;
}

interface TaxEntry {
  accountName: string;
  account_id?: number;
  debit: number;
  credit: number;
  taxType?: 'CGST' | 'SGST' | 'IGST';
  taxRate?: number;
}

@Component({
  selector: 'app-tax-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    TallyShortcutsDirective
  ],
  templateUrl: './tax-payment.component.html',
  styleUrls: ['./tax-payment.component.css']
})
export class TaxPaymentComponent implements OnInit {
  taxForm!: FormGroup;
  submitted = false;
  saving = false;
  searchTerms: { [key: number]: string } = {};
  filteredAccounts: AccountHead[][] = [];
  allAccounts: AccountHead[] = [];
  showAccountDropdown: boolean[] = [];
  
  taxPeriod: 'Monthly' | 'Quarterly' = 'Monthly';
  totalLiability = 0;
  totalCredit = 0;
  netPayable = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
  }

  initForm(): void {
    this.taxForm = this.fb.group({
      voucherNumber: [''],
      date: [new Date(), Validators.required],
      periodFrom: [new Date(), Validators.required],
      periodTo: [new Date(), Validators.required],
      entries: this.fb.array([]),
      narration: ['']
    });
    
    // Add initial rows for CGST, SGST, IGST
    this.addEntryRow('CGST Payable');
    this.addEntryRow('SGST Payable');
    this.addEntryRow('IGST Payable');
    this.addEntryRow('Input Credit');
  }

  get entries(): FormArray {
    return this.taxForm.get('entries') as FormArray;
  }

  addEntryRow(defaultName = ''): void {
    const entry = this.fb.group({
      accountName: [defaultName, Validators.required],
      account_id: [null],
      debit: [0],
      credit: [0],
      taxType: [this.getTaxTypeFromName(defaultName)],
      taxRate: [18]
    });
    this.entries.push(entry);
    const index = this.entries.length - 1;
    this.filteredAccounts[index] = [];
    this.showAccountDropdown[index] = false;
    this.calculateTotals();
  }

  deleteEntry(index: number): void {
    if (this.entries.length > 1) {
      this.entries.removeAt(index);
      this.filteredAccounts.splice(index, 1);
      this.showAccountDropdown.splice(index, 1);
      this.calculateTotals();
    }
  }

  getTaxTypeFromName(name: string): 'CGST' | 'SGST' | 'IGST' | undefined {
    if (name.includes('CGST')) return 'CGST';
    if (name.includes('SGST')) return 'SGST';
    if (name.includes('IGST')) return 'IGST';
    return undefined;
  }

  loadAccounts(): void {
    // Simulating service call - replace with actual service
    this.allAccounts = [
      { id: 1, name: 'CGST Payable', group: 'Duties & Taxes', type: 1, openingBalance: 0, currentBalance: 5000 },
      { id: 2, name: 'SGST Payable', group: 'Duties & Taxes', type: 1, openingBalance: 0, currentBalance: 5000 },
      { id: 3, name: 'IGST Payable', group: 'Duties & Taxes', type: 1, openingBalance: 0, currentBalance: 10000 },
      { id: 4, name: 'Input Credit CGST', group: 'Current Assets', type: 0, openingBalance: 0, currentBalance: 3000 },
      { id: 5, name: 'Input Credit SGST', group: 'Current Assets', type: 0, openingBalance: 0, currentBalance: 3000 },
      { id: 6, name: 'Input Credit IGST', group: 'Current Assets', type: 0, openingBalance: 0, currentBalance: 6000 },
      { id: 7, name: 'Cash', group: 'Cash-in-hand', type: 0, openingBalance: 50000, currentBalance: 45000 },
      { id: 8, name: 'Bank Account', group: 'Bank Accounts', type: 0, openingBalance: 100000, currentBalance: 95000 }
    ];
  }

  onSearch(index: number, term: string): void {
    this.searchTerms[index] = term;
    if (term.length >= 2) {
      this.filteredAccounts[index] = this.allAccounts.filter((acc: AccountHead) =>
        acc.name.toLowerCase().includes(term.toLowerCase())
      );
      this.showAccountDropdown[index] = true;
    } else {
      this.filteredAccounts[index] = [];
      this.showAccountDropdown[index] = false;
    }
  }

  selectAccount(index: number, account: AccountHead): void {
    const entry = this.entries.at(index);
    if (entry) {
      entry.patchValue({
        accountName: account.name,
        account_id: account.id
      });
    }
    this.showAccountDropdown[index] = false;
    this.calculateTotals();
  }

  onAmountChange(): void {
    this.calculateTotals();
  }

  calculateTotals(): void {
    let liability = 0;
    let credit = 0;

    this.entries.controls.forEach((control) => {
      const entry = control.value;
      const taxType = entry.taxType;
      
      if (taxType && (taxType === 'CGST' || taxType === 'SGST' || taxType === 'IGST')) {
        if (entry.accountName.includes('Payable')) {
          liability += (entry.debit || 0) + (entry.credit || 0);
        } else if (entry.accountName.includes('Input Credit') || entry.accountName.includes('Credit')) {
          credit += (entry.debit || 0) + (entry.credit || 0);
        }
      }
    });

    this.totalLiability = liability;
    this.totalCredit = credit;
    this.netPayable = liability - credit;
  }

  isBalanced(): boolean {
    // For tax payment, we consider it valid if net payable is non-negative
    return this.netPayable >= 0;
  }

  onShortcut(event: string): void {
    switch (event) {
      case 'NEW':
      case 'TAX_PAYMENT':
        this.newTaxPayment();
        break;
      case 'SAVE':
        this.saveTaxPayment();
        break;
      case 'CANCEL':
        this.cancel();
        break;
    }
  }

  newTaxPayment(): void {
    this.taxForm.reset({
      date: new Date(),
      periodFrom: new Date(),
      periodTo: new Date()
    });
    this.entries.clear();
    this.filteredAccounts = [];
    this.showAccountDropdown = [];
    this.addEntryRow('CGST Payable');
    this.addEntryRow('SGST Payable');
    this.addEntryRow('IGST Payable');
    this.addEntryRow('Input Credit');
    this.submitted = false;
    this.calculateTotals();
  }

  saveTaxPayment(): void {
    if (this.taxForm.invalid || !this.isBalanced()) {
      this.submitted = true;
      this.taxForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Tax Payment Saved:', this.taxForm.value);
      this.saving = false;
      alert('Tax Payment saved successfully!');
      this.router.navigate(['/accounting']);
    }, 500);
  }

  cancel(): void {
    if (confirm('Discard changes and exit?')) {
      this.router.navigate(['/accounting']);
    }
  }

  togglePeriod(): void {
    this.taxPeriod = this.taxPeriod === 'Monthly' ? 'Quarterly' : 'Monthly';
  }
}
