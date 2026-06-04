import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { RecurringVoucherService } from '../../core/services/recurring-voucher.service';
import { AccountHead } from '../../core/models/accounting.model';
import { AccountingService } from '../../core/services/accounting.service';

interface FrequencyOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-recurring-voucher-create',
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
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatCheckboxModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './recurring-voucher-create.component.html',
  styleUrls: ['./recurring-voucher-create.component.scss']
})
export class RecurringVoucherCreateComponent implements OnInit {
  form!: FormGroup;
  isLoading = signal(false);
  isEditMode = false;
  voucherId: string | null = null;
  
  frequencies: FrequencyOption[] = [
    { value: 'Daily', viewValue: 'Daily' },
    { value: 'Weekly', viewValue: 'Weekly' },
    { value: 'Monthly', viewValue: 'Monthly' },
    { value: 'Quarterly', viewValue: 'Quarterly' },
    { value: 'Yearly', viewValue: 'Yearly' }
  ];

  accountHeads: AccountHead[] = [];
  displayedColumns: string[] = ['accountHead', 'debit', 'credit', 'actions'];
  entries: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private recurringVoucherService: RecurringVoucherService,
    private accountingService: AccountingService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccountHeads();
    
    this.voucherId = this.route.snapshot.paramMap.get('id');
    if (this.voucherId) {
      this.isEditMode = true;
      this.loadVoucher(this.voucherId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      voucherType: ['Journal', Validators.required],
      frequency: ['Monthly', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      dayOfMonth: [1],
      isActive: [true]
    });
  }

  loadAccountHeads(): void {
    this.accountingService.getAccountHeads().subscribe({
      next: (heads) => {
        this.accountHeads = heads;
      },
      error: (err) => {
        this.snackBar.open('Failed to load account heads', 'Close', { duration: 3000 });
      }
    });
  }

  loadVoucher(id: string): void {
    this.recurringVoucherService.getById(id).subscribe({
      next: (voucher) => {
        this.form.patchValue({
          name: voucher.name,
          description: voucher.description,
          voucherType: voucher.voucherType,
          frequency: voucher.frequency,
          startDate: new Date(voucher.startDate),
          endDate: voucher.endDate ? new Date(voucher.endDate) : null,
          dayOfMonth: voucher.dayOfMonth || 1,
          isActive: voucher.isActive
        });
        this.entries = voucher.entries || [];
      },
      error: (err) => {
        this.snackBar.open('Failed to load voucher template', 'Close', { duration: 3000 });
      }
    });
  }

  addEntry(): void {
    this.entries.push({
      accountHeadId: null,
      debit: 0,
      credit: 0
    });
  }

  removeEntry(index: number): void {
    this.entries.splice(index, 1);
  }

  onSave(): void {
    if (this.form.invalid || this.entries.length === 0) {
      this.snackBar.open('Please fill all required fields and add at least one entry', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    const formData = {
      ...this.form.value,
      entries: this.entries
    };

    const request$ = this.isEditMode
      ? this.recurringVoucherService.update(this.voucherId!, formData)
      : this.recurringVoucherService.create(formData);

    request$.subscribe({
      next: (response) => {
        this.snackBar.open(
          this.isEditMode ? 'Template updated successfully' : 'Template created successfully',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/accounting/recurring-vouchers']);
      },
      error: (err) => {
        this.snackBar.open('Failed to save template', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/accounting/recurring-vouchers']);
  }

  get f() {
    return this.form.controls;
  }
}
