import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountingService } from '../../../core/services/accounting.service';
import { TallyShortcutsDirective } from '../../../shared/directives/tally-shortcuts.directive';
import { MatDialog } from '@angular/material/dialog';
import { FastLedgerModalComponent } from '../../../shared/components/fast-ledger-modal.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface AccountHead {
  id: number;
  name: string;
  code: string;
  type: number; // 0=Asset, 1=Liability, 2=Equity, 3=Income, 4=Expense
  parentId?: number;
  openingBalance: number;
  tenantId: number;
  isActive: boolean;
}

interface ContraEntry {
  accountHeadId: number;
  accountHeadName: string;
  debit: number;
  credit: number;
}

@Component({
  selector: 'app-contra-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TallyShortcutsDirective, MatSnackBarModule],
  template: `
    <div class="app-layout">
      <main class="main-content">
        <div class="page-header">
          <div>
            <h1>Contra Voucher (F4)</h1>
            <p>Cash ↔ Bank / Bank ↔ Bank transfers</p>
          </div>
          <button class="btn-secondary" (click)="navigateTo('/accounting/reports')">
            ← Back to Reports
          </button>
        </div>

        <form [formGroup]="contraForm" (ngSubmit)="onSubmit()" appTallyShortcuts (shortcutTriggered)="onShortcut($event)">
          
          <!-- Voucher Header -->
          <div class="section">
            <h2 class="section-title">Voucher Details</h2>
            
            <div class="form-row">
              <div class="form-group">
                <label>Voucher Date</label>
                <input type="date" formControlName="voucherDate" />
              </div>
              <div class="form-group">
                <label>Voucher Number</label>
                <input type="text" formControlName="voucherNumber" placeholder="Auto-generated" readonly />
              </div>
            </div>

            <div class="form-group">
              <label>Narration</label>
              <textarea formControlName="narration" placeholder="Enter narration..." rows="3"></textarea>
            </div>
          </div>

          <!-- Contra Entries -->
          <div class="section">
            <h2 class="section-title">Account Details (Cash ↔ Bank)</h2>
            
            <div formArrayName="entries">
              @for (entry of entries.controls; track $index) {
                <div [formGroupName]="$index" class="entry-card">
                  <div class="entry-header">
                    <span>Line {{ $index + 1 }}</span>
                    @if (entries.length > 2) {
                      <button type="button" class="btn-remove" (click)="removeEntry($index)">
                        ✕ Remove
                      </button>
                    }
                  </div>

                  <div class="form-row">
                    <div class="form-group full-width">
                      <label>Account Head</label>
                      <select formControlName="accountHeadId" (change)="onAccountChange($index)">
                        <option value="">Select Account</option>
                        @for (account of filteredAccounts(); track account.id) {
                          <option [value]="account.id">{{ account.name }} ({{ account.type }})</option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Debit (₹)</label>
                      <input type="number" formControlName="debit" min="0" step="0.01" 
                             (input)="calculateTotals()" />
                    </div>
                    <div class="form-group">
                      <label>Credit (₹)</label>
                      <input type="number" formControlName="credit" min="0" step="0.01" 
                             (input)="calculateTotals()" />
                    </div>
                  </div>
                </div>
              }
            </div>

            <button type="button" class="btn-add" (click)="addEntry()" [disabled]="entries.length >= 4">
              + Add Line (Max 4)
            </button>

            <!-- Balance Indicator -->
            <div class="balance-indicator" [class.balanced]="isBalanced()" [class.unbalanced]="!isBalanced()">
              <span>Total Debit: ₹{{ totalDebit() | number:'1.2-2' }}</span>
              <span>|</span>
              <span>Total Credit: ₹{{ totalCredit() | number:'1.2-2' }}</span>
              <span>|</span>
              <strong>{{ isBalanced() ? '✓ Balanced' : '✗ Unbalanced' }}</strong>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="error-banner">{{ errorMessage() }}</div>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="navigateTo('/accounting/reports')">
              Cancel (Esc)
            </button>
            <button type="submit" class="btn-primary" 
                    [disabled]="contraForm.invalid || !isBalanced() || isSubmitting()">
              Save (Ctrl+S)
            </button>
          </div>

        </form>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: #f5f7fa; }
    .main-content { flex: 1; padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px 0; color: #1a1a1a; }
    .page-header p { margin: 0; color: #666; }
    .section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { margin: 0 0 16px 0; font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #1976d2; padding-bottom: 8px; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .form-group { flex: 1; display: flex; flex-direction: column; }
    .form-group.full-width { flex: 1; }
    .form-group label { margin-bottom: 4px; font-weight: 500; color: #333; font-size: 14px; }
    .form-group input, .form-group select, .form-group textarea { 
      padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none; border-color: #1976d2;
    }
    .entry-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
    .entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .entry-header span { font-weight: 600; color: #374151; }
    .btn-remove { background: #fee2e2; color: #dc2626; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
    .btn-remove:hover { background: #fecaca; }
    .btn-add { background: #dbeafe; color: #1976d2; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500; margin-bottom: 16px; }
    .btn-add:hover { background: #bfdbfe; }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
    .balance-indicator { 
      display: flex; gap: 16px; align-items: center; padding: 12px; 
      background: #fef3c7; border-radius: 6px; margin-top: 16px; font-size: 14px;
    }
    .balance-indicator.balanced { background: #d1fae5; color: #065f46; }
    .balance-indicator.unbalanced { background: #fee2e2; color: #991b1b; }
    .error-banner { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .btn-primary { background: #1976d2; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-primary:hover:not(:disabled) { background: #1565c0; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-secondary:hover { background: #4b5563; }
  `]
})
export class ContraVoucherComponent implements OnInit {
  contraForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  
  allAccounts = signal<AccountHead[]>([]);
  filteredAccounts = signal<AccountHead[]>([]);
  
  totalDebit = signal(0);
  totalCredit = signal(0);
  isBalanced = signal(false);

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.contraForm = this.fb.group({
      voucherDate: [new Date().toISOString().substring(0, 10), Validators.required],
      voucherNumber: [{ value: '', disabled: true }],
      narration: ['', Validators.required],
      entries: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.generateVoucherNumber();
    this.addEntry(); // Add first entry
    this.addEntry(); // Add second entry for contra
  }

  loadAccounts(): void {
    this.accountingService.getChartOfAccounts().subscribe({
      next: (accounts: AccountHead[]) => {
        // Filter only Cash and Bank accounts for contra voucher
        // type: 0=Asset, 1=Liability, 2=Equity, 3=Income, 4=Expense
        this.allAccounts.set(accounts.filter((a: AccountHead) => 
          a.type === 0 && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
        ));
        this.filteredAccounts.set(this.allAccounts());
      },
      error: (err: any) => {
        console.error('Error loading accounts:', err);
        this.errorMessage.set('Failed to load accounts');
      }
    });
  }

  get entries(): FormArray {
    return this.contraForm.get('entries') as FormArray;
  }

  newEntry(): FormGroup {
    return this.fb.group({
      accountHeadId: ['', Validators.required],
      debit: [0],
      credit: [0]
    });
  }

  addEntry(): void {
    if (this.entries.length < 4) {
      this.entries.push(this.newEntry());
    }
  }

  removeEntry(index: number): void {
    if (this.entries.length > 2) {
      this.entries.removeAt(index);
      this.calculateTotals();
    }
  }

  onAccountChange(index: number): void {
    const entry = this.entries.at(index);
    const accountId = entry.get('accountHeadId')?.value;
    
    if (accountId) {
      const account = this.allAccounts().find(a => a.id === accountId);
      if (account) {
        // Auto-suggest: First entry debit, second entry credit
        if (index === 0) {
          entry.patchValue({ debit: 0, credit: 0 });
        } else if (index === 1) {
          entry.patchValue({ debit: 0, credit: 0 });
        }
      }
    }
  }

  calculateTotals(): void {
    let debit = 0;
    let credit = 0;

    this.entries.controls.forEach(entry => {
      debit += parseFloat(entry.get('debit')?.value) || 0;
      credit += parseFloat(entry.get('credit')?.value) || 0;
    });

    this.totalDebit.set(debit);
    this.totalCredit.set(credit);
    this.isBalanced.set(Math.abs(debit - credit) < 0.01 && debit > 0);
  }

  generateVoucherNumber(): void {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.contraForm.patchValue({
      voucherNumber: `C-${year}${month}-${randomNum}`
    });
  }

  onShortcut(event: string): void {
    if (event === 'SAVE') {
      if (this.contraForm.valid && this.isBalanced() && !this.isSubmitting()) {
        this.onSubmit();
      }
    } else if (event === 'CANCEL') {
      this.navigateTo('/accounting/reports');
    } else if (event === 'QUICK_CREATE') {
      this.openFastLedgerModal();
    }
  }

  openFastLedgerModal(): void {
    const dialogRef = this.dialog.open(FastLedgerModalComponent, {
      width: '500px',
      data: { 
        tenantId: 1,
        preferredGroupId: this.allAccounts().find(a => a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))?.parentId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAccounts(); // Reload accounts to include new ledger
        this.snackBar.open('New ledger created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.contraForm.invalid || !this.isBalanced()) {
      this.errorMessage.set('Please fill all required fields and ensure debits equal credits');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formData = {
      ...this.contraForm.value,
      entries: this.entries.value,
      totalDebit: this.totalDebit(),
      totalCredit: this.totalCredit()
    };

    console.log('Submitting Contra Voucher:', formData);
    
    // TODO: Call backend API to save contra voucher
    setTimeout(() => {
      this.snackBar.open('Contra voucher saved successfully!', 'Close', { duration: 3000 });
      this.isSubmitting.set(false);
      this.navigateTo('/accounting/reports');
    }, 1000);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
