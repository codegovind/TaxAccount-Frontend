import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AccountingService } from '../../core/services/accounting.service';
import { TallyShortcutsDirective } from '../../shared/directives/tally-shortcuts.directive';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface AccountHead {
  id: string;
  name: string;
  type: number; // 0=Asset, 1=Liability, 2=Equity, 3=Income, 4=Expense
  groupName: string;
}

interface InvoiceItem {
  accountId: string;
  accountName: string;
  quantity: number;
  rate: number;
  taxRate: number;
  discount: number;
  amount: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
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
    MatAutocompleteModule,
    MatTooltipModule,
    TallyShortcutsDirective,
    MatSnackBarModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  invoiceForm!: FormGroup;
  allAccounts: AccountHead[] = [];
  filteredAccounts: AccountHead[] = [];
  isLoading = false;
  isSaving = false;
  subtotal = 0;
  totalTax = 0;
  totalDiscount = 0;
  grandTotal = 0;
  
  private destroy$ = new Subject<void>();

  @ViewChild('customerInput') customerInput!: ElementRef;
  @ViewChild('itemInput0') itemInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
    this.setupLiveCalculations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      customerName: [''],
      invoiceDate: [new Date(), Validators.required],
      dueDate: [new Date()],
      referenceNo: [''],
      shippingAddress: [''],
      items: this.fb.array([this.createItemRow()]),
      narration: ['']
    });
  }

  createItemRow(): FormGroup {
    return this.fb.group({
      accountId: [''],
      accountName: [''],
      quantity: [1, Validators.min(1)],
      rate: [0, Validators.min(0)],
      taxRate: [18],
      discount: [0],
      amount: [0]
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addNewItem(): void {
    this.items.push(this.createItemRow());
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[formcontrolname="accountName"]');
      const lastInput = inputs[inputs.length - 1] as HTMLElement;
      if (lastInput) lastInput.focus();
    }, 100);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateTotals();
    }
  }

  loadAccounts(): void {
    this.accountingService.getChartOfAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts: any[]) => {
          this.allAccounts = accounts.filter((a: any) => a.type === 3 || a.type === 4); // Income/Expense for items
          this.filteredAccounts = [...this.allAccounts];
        },
        error: (err: any) => console.error('Error loading accounts', err)
      });
  }

  filterAccounts(query: string, index: number): void {
    const control = this.items.at(index);
    if (query.length >= 2) {
      this.filteredAccounts = this.allAccounts.filter(acc =>
        acc.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.filteredAccounts = [...this.allAccounts];
    }
  }

  selectAccount(account: AccountHead, index: number): void {
    const control = this.items.at(index);
    control.patchValue({
      accountId: account.id,
      accountName: account.name
    });
    this.calculateLineTotal(index);
  }

  calculateLineTotal(index: number): void {
    const item = this.items.at(index);
    const qty = item.get('quantity')?.value || 0;
    const rate = item.get('rate')?.value || 0;
    const taxRate = item.get('taxRate')?.value || 0;
    const discount = item.get('discount')?.value || 0;

    const baseAmount = qty * rate;
    const taxAmount = (baseAmount * taxRate) / 100;
    const finalAmount = baseAmount + taxAmount - discount;

    item.patchValue({ amount: finalAmount }, { emitEvent: false });
    this.calculateTotals();
  }

  setupLiveCalculations(): void {
    this.items.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.subtotal = 0;
    this.totalTax = 0;
    this.totalDiscount = 0;

    this.items.controls.forEach((item) => {
      const qty = item.get('quantity')?.value || 0;
      const rate = item.get('rate')?.value || 0;
      const taxRate = item.get('taxRate')?.value || 0;
      const discount = item.get('discount')?.value || 0;

      const baseAmount = qty * rate;
      const taxAmount = (baseAmount * taxRate) / 100;

      this.subtotal += baseAmount;
      this.totalTax += taxAmount;
      this.totalDiscount += discount;
    });

    this.grandTotal = this.subtotal + this.totalTax - this.totalDiscount;
  }

  onShortcut(action: string): void {
    switch (action) {
      case 'SAVE':
        if (this.invoiceForm.valid && !this.isSaving) {
          this.saveInvoice();
        }
        break;
      case 'CANCEL':
        this.router.navigate(['/invoices']);
        break;
      case 'NEW':
        this.initForm();
        this.calculateTotals();
        break;
    }
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const tenantId = this.authService.getTenantId();
    if (!tenantId) {
      this.snackBar.open('Tenant context missing. Cannot save invoice.', 'Close', { duration: 4000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.invoiceForm.value;
    
    const voucherData = {
      tenantId: tenantId,
      voucherType: 10, // Invoice type
      date: formValue.invoiceDate,
      entries: this.items.controls.map((item, idx) => ({
        accountId: item.get('accountId')?.value,
        debitAmount: idx === 0 ? this.grandTotal : 0,
        creditAmount: idx > 0 ? item.get('amount')?.value : 0,
        narration: item.get('accountName')?.value || ''
      })),
      narration: formValue.narration,
      referenceNumber: formValue.referenceNo
    };

    // TODO: Add createVoucher method to AccountingService
    // Replace console/alert with snackbar for user friendly, non-blocking feedback
    console.log('Saving invoice:', voucherData);
    this.snackBar.open('Invoice saved successfully!', 'Close', { duration: 3000 });
    this.router.navigate(['/invoices']);
  }

  cancel(): void {
    if (confirm('Discard changes?')) {
      this.router.navigate(['/invoices']);
    }
  }

  autoFocus(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const elements = Array.from(form.querySelectorAll('input, select'));
      const currentIndex = elements.indexOf(event.target as HTMLInputElement);
      if (currentIndex < elements.length - 1) {
        (elements[currentIndex + 1] as HTMLElement).focus();
      }
    }
  }
}
