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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { AccountingService } from '../../../core/services/accounting.service';
import { AuthService } from '../../../core/services/auth.service';
import { TallyShortcutsDirective } from '../../../shared/directives/tally-shortcuts.directive';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface AccountHead { id: number; name: string; code?: string; groupId: number; groupName: string; type: number; }

@Component({
  selector: 'app-debit-note',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, MatCardModule, MatDividerModule, MatAutocompleteModule, TallyShortcutsDirective, MatSnackBarModule],
  templateUrl: './debit-note.component.html',
  styleUrls: ['./debit-note.component.css']
})
export class DebitNoteComponent implements OnInit, OnDestroy {
  voucherForm!: FormGroup; allAccounts: AccountHead[] = []; filteredAccounts: AccountHead[] = []; isLoading = false; isSaving = false; totalAmount = 0; private destroy$ = new Subject<void>();
  constructor(private fb: FormBuilder, private accountingService: AccountingService, private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.initForm(); this.loadAccounts(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
  initForm(): void { this.voucherForm = this.fb.group({ date: [new Date().toISOString().split('T')[0], [Validators.required]], referenceNo: [''], reason: ['', Validators.required], supplierAccount: ['', Validators.required], entries: this.fb.array([this.createEntry()]) }); }
  createEntry(): FormGroup { return this.fb.group({ accountId: ['', Validators.required], accountName: [''], amount: [0, [Validators.min(0.01)]], narration: [''] }); }
  get entries(): FormArray { return this.voucherForm.get('entries') as FormArray; }
  addEntry(): void { this.entries.push(this.createEntry()); setTimeout(() => this.calculateTotal(), 100); }
  removeEntry(index: number): void { if (this.entries.length > 1) { this.entries.removeAt(index); this.calculateTotal(); } }
  loadAccounts(): void { this.isLoading = true; this.accountingService.getChartOfAccounts().pipe(takeUntil(this.destroy$)).subscribe(accounts => { this.allAccounts = accounts as any; this.filteredAccounts = accounts as any; this.isLoading = false; }); }
  filterAccounts(searchText: string): void { if (!searchText || searchText.length < 2) { this.filteredAccounts = this.allAccounts; return; } const search = searchText.toLowerCase(); this.filteredAccounts = this.allAccounts.filter(a => a.name.toLowerCase().includes(search)); }
  selectAccount(account: AccountHead, index: number): void { const entry = this.entries.at(index); entry.patchValue({ accountId: account.id, accountName: account.name }); this.filteredAccounts = this.allAccounts; }
  calculateTotal(): void { this.totalAmount = this.entries.controls.reduce((sum, ctrl) => sum + (ctrl.get('amount')?.value || 0), 0); }
  onShortcut(shortcut: string): void { switch (shortcut) { case 'NEW_ENTRY': this.resetForm(); break; case 'SAVE': this.saveVoucher(); break; case 'CANCEL': this.cancel(); break; } }
  saveVoucher(): void { if (!this.voucherForm.valid) { this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 }); return; } this.isSaving = true; const formValue = this.voucherForm.value; const voucherEntries = formValue.entries.map((e: any) => ({ accountId: e.accountId, amount: e.amount, narration: e.narration })); const tenantId = this.authService.getTenantId(); if (!tenantId) { this.snackBar.open('Tenant context missing. Cannot save debit note.', 'Close', { duration: 4000 }); this.isSaving = false; return; } const voucherData = { voucherType: 'DebitNote', date: formValue.date, referenceNo: formValue.referenceNo, reason: formValue.reason, supplierId: formValue.supplierAccount, entries: voucherEntries, totalAmount: this.totalAmount, tenantId }; console.log('Saving debit note:', voucherData); this.snackBar.open('Debit Note saved successfully!', 'Close', { duration: 3000 }); this.resetForm(); }
  resetForm(): void { this.voucherForm.reset({ date: new Date().toISOString().split('T')[0], referenceNo: '', reason: '', supplierAccount: '', entries: [this.createEntry()] }); this.calculateTotal(); }
  cancel(): void { if (confirm('Discard changes?')) { this.router.navigate(['/accounting']); } }
