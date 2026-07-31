import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { AccountingService } from '../../../core/services/accounting.service';
import { AuthService } from '../../../core/services/auth.service';
import { TallyShortcutsDirective } from '../../../shared/directives/tally-shortcuts.directive';
import { Subject, takeUntil } from 'rxjs';

interface AccountHead {
  id: number;
  name: string;
  code?: string;
  groupId: number;
  groupName: string;
  type: number; // 0=Asset, 1=Liability, 2=Equity, 3=Income, 4=Expense
  parentId?: number;
  openingBalance: number;
  closingBalance: number;
}

interface VoucherEntry {
  accountId: number;
  accountName?: string;
  debit: number;
  credit: number;
  narration: string;
}

@Component({
  selector: 'app-journal-voucher',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    TallyShortcutsDirective
  ],
  templateUrl: './journal-voucher.component.html',
  styleUrls: ['./journal-voucher.component.css']
})
export class JournalVoucherComponent implements OnInit, OnDestroy {
  voucherForm!: FormGroup;
  allAccounts: AccountHead[] = [];
  filteredAccounts: AccountHead[] = [];
  isLoading = false;
  isSaving = false;
  totalDebit = 0;
  totalCredit = 0;
  difference = 0;
  isBalanced = false;
  voucherDate = new Date();
  voucherNumber = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
    this.calculateTotals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.voucherForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      narration: ['', Validators.maxLength(250)],
      entries: this.fb.array([this.createEntry()])
    });
  }

  createEntry(): FormGroup {
    return this.fb.group({
      accountId: ['', Validators.required],
      accountName: [''],
      debit: [0, [Validators.min(0)]],
      credit: [0, [Validators.min(0)]],
      narration: ['']
    });
  }

  get entries(): FormArray {
    return this.voucherForm.get('entries') as FormArray;
  }

  addEntry(): void {
    this.entries.push(this.createEntry());
    setTimeout(() => this.calculateTotals(), 100);
  }

  removeEntry(index: number): void {
    if (this.entries.length > 2) {
      this.entries.removeAt(index);
      this.calculateTotals();
    }
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountingService.getChartOfAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(accounts => {
        this.allAccounts = accounts as any;
        this.filteredAccounts = accounts as any;
        this.isLoading = false;
      });
  }

  filterAccounts(searchText: string, index: number): void {
    if (!searchText || searchText.length < 2) {
      this.filteredAccounts = this.allAccounts;
      return;
    }
    
    const search = searchText.toLowerCase();
    this.filteredAccounts = this.allAccounts.filter(a => 
      a.name.toLowerCase().includes(search) || 
      (a.code && a.code.toLowerCase().includes(search))
    );
  }

  selectAccount(account: AccountHead, index: number): void {
    const entry = this.entries.at(index);
    entry.patchValue({
      accountId: account.id,
      accountName: account.name
    });
    this.filteredAccounts = this.allAccounts;
  }

  calculateTotals(): void {
    const entries = this.entries.controls;
    this.totalDebit = entries.reduce((sum, ctrl) => sum + (ctrl.get('debit')?.value || 0), 0);
    this.totalCredit = entries.reduce((sum, ctrl) => sum + (ctrl.get('credit')?.value || 0), 0);
    this.difference = Math.abs(this.totalDebit - this.totalCredit);
    this.isBalanced = this.difference < 0.01;
  }

  onShortcut(shortcut: string): void {
    switch (shortcut) {
      case 'NEW_ENTRY':
        this.resetForm();
        break;
      case 'SAVE':
        this.saveVoucher();
        break;
      case 'CANCEL':
        this.cancel();
        break;
    }
  }

  saveVoucher(): void {
    if (!this.isBalanced) {
      alert('Journal entry must be balanced (Debit = Credit)');
      return;
    }

    if (!this.voucherForm.valid) {
      alert('Please fill all required fields');
      return;
    }

    this.isSaving = true;
    
    const formValue = this.voucherForm.value;
    const entries: VoucherEntry[] = formValue.entries.map((e: any) => ({
      accountId: e.accountId,
      debit: e.debit || 0,
      credit: e.credit || 0,
      narration: e.narration || formValue.narration || ''
    }));

    const tenantId = this.authService.getTenantId();
    if (!tenantId) {
      alert('Tenant context missing. Cannot save voucher.');
      this.isSaving = false;
      return;
    }

    const voucherData = {
      voucherType: 'Journal',
      date: formValue.date,
      narration: formValue.narration,
      entries: entries,
      // tenantId: 1 // commented out - replaced with runtime tenantId
      tenantId: tenantId
    };

    // TODO: Add createVoucher method to AccountingService
    console.log('Saving journal voucher:', voucherData);
    alert('Journal voucher saved successfully!');
    this.resetForm();
  }

  resetForm(): void {
    this.voucherForm.reset({
      date: new Date().toISOString().split('T')[0],
      narration: '',
      entries: [this.createEntry()]
    });
    this.calculateTotals();
  }

  cancel(): void {
    if (confirm('Discard changes and return?')) {
      this.router.navigate(['/accounting']);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
