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
import { Router } from '@angular/router';
import { AccountingService } from '../../../core/services/accounting.service';
import { TallyShortcutsDirective, ShortcutType } from '../../../shared/directives/tally-shortcuts.directive';
import { Subject, takeUntil } from 'rxjs';

interface AccountHead {
  id: number;
  name: string;
  code?: string;
  groupId: number;
  groupName: string;
  type: number;
}

@Component({
  selector: 'app-credit-note',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, MatCardModule, MatDividerModule, TallyShortcutsDirective],
  templateUrl: './credit-note.component.html',
  styleUrls: ['./credit-note.component.css']
})
export class CreditNoteComponent implements OnInit, OnDestroy {
  voucherForm!: FormGroup;
  allAccounts: AccountHead[] = [];
  filteredAccounts: AccountHead[] = [];
  isLoading = false;
  isSaving = false;
  totalAmount = 0;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private accountingService: AccountingService, private router: Router) {}

  ngOnInit(): void { this.initForm(); this.loadAccounts(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  initForm(): void {
    this.voucherForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      referenceNo: [''],
      reason: ['', Validators.required],
      customerAccount: ['', Validators.required],
      entries: this.fb.array([this.createEntry()])
    });
  }

  createEntry(): FormGroup {
    return this.fb.group({
      accountId: ['', Validators.required],
      accountName: [''],
      amount: [0, [Validators.min(0.01)]],
      narration: ['']
    });
  }

  get entries(): FormArray { return this.voucherForm.get('entries') as FormArray; }

  addEntry(): void { this.entries.push(this.createEntry()); setTimeout(() => this.calculateTotal(), 100); }
  removeEntry(index: number): void { if (this.entries.length > 1) { this.entries.removeAt(index); this.calculateTotal(); } }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountingService.getChartOfAccounts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (accounts: AccountHead[]) => { this.allAccounts = accounts; this.filteredAccounts = accounts; this.isLoading = false; },
      error: (err: any) => { console.error('Error loading accounts:', err); this.isLoading = false; }
    });
  }

  filterAccounts(searchText: string): void {
    if (!searchText || searchText.length < 2) { this.filteredAccounts = this.allAccounts; return; }
    const search = searchText.toLowerCase();
    this.filteredAccounts = this.allAccounts.filter(a => a.name.toLowerCase().includes(search));
  }

  selectAccount(account: AccountHead, index: number): void {
    const entry = this.entries.at(index);
    entry.patchValue({ accountId: account.id, accountName: account.name });
    this.filteredAccounts = this.allAccounts;
  }

  calculateTotal(): void {
    this.totalAmount = this.entries.controls.reduce((sum, ctrl) => sum + (ctrl.get('amount')?.value || 0), 0);
  }

  onShortcut(shortcut: ShortcutType): void {
    switch (shortcut) {
      case ShortcutType.NEW_ENTRY: this.resetForm(); break;
      case ShortcutType.SAVE: this.saveVoucher(); break;
      case ShortcutType.CANCEL: this.cancel(); break;
    }
  }

  saveVoucher(): void {
    if (!this.voucherForm.valid) { alert('Please fill all required fields'); return; }
    this.isSaving = true;
    const formValue = this.voucherForm.value;
    const voucherData = {
      voucherType: 'CreditNote',
      date: formValue.date,
      referenceNo: formValue.referenceNo,
      reason: formValue.reason,
      customerId: formValue.customerAccount,
      entries: formValue.entries.map((e: any) => ({ accountId: e.accountId, amount: e.amount, narration: e.narration })),
      totalAmount: this.totalAmount,
      tenantId: 1
    };
    this.accountingService.createVoucher(voucherData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.isSaving = false; alert('Credit Note saved successfully!'); this.resetForm(); },
      error: (err: any) => { console.error('Error:', err); this.isSaving = false; alert('Error saving credit note'); }
    });
  }

  resetForm(): void {
    this.voucherForm.reset({ date: new Date().toISOString().split('T')[0], referenceNo: '', reason: '', customerAccount: '', entries: [this.createEntry()] });
    this.calculateTotal();
  }

  cancel(): void { if (confirm('Discard changes?')) { this.router.navigate(['/accounting']); } }
}
