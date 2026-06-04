import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { StockJournalService, StockJournalType, StockJournalItemDto, GodownDto, ProductDto } from '../../core/services/stock-journal.service';
import { ActivatedRoute, Router } from '@angular/router';

interface JournalEntryRow {
  productId: number;
  productName: string;
  quantity: number;
  rate: number;
  godownId: number;
  godownName: string;
  amount: number;
}

@Component({
  selector: 'app-stock-journal-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './stock-journal-entry.component.html',
  styleUrls: ['./stock-journal-entry.component.scss']
})
export class StockJournalEntryComponent implements OnInit {
  journalForm!: FormGroup;
  isSaving = signal(false);
  isLoading = signal(true);
  
  journalTypes = Object.values(StockJournalType);
  selectedType = signal<StockJournalType>(StockJournalType.Manufacturing);
  
  godowns = signal<GodownDto[]>([]);
  products = signal<ProductDto[]>([]);
  
  sourceItems = signal<JournalEntryRow[]>([]);
  destinationItems = signal<JournalEntryRow[]>([]);
  
  voucherNumber = signal<string>('');
  
  displayedColumns = ['product', 'godown', 'quantity', 'rate', 'amount', 'actions'];

  constructor(
    private fb: FormBuilder,
    private stockJournalService: StockJournalService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    
    // Check for edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadJournalForEdit(+id);
    }
  }

  initForm(): void {
    this.journalForm = this.fb.group({
      voucherDate: [new Date(), Validators.required],
      journalType: [StockJournalType.Manufacturing, Validators.required],
      reference: [''],
      narration: [''],
      sourceGodownId: [null, Validators.required],
      destinationGodownId: [null],
      manufacturingProcess: ['']
    });

    // React to type changes
    this.journalForm.get('journalType')?.valueChanges.subscribe((type: StockJournalType) => {
      this.selectedType.set(type);
      this.updateFormValidation(type);
    });
  }

  updateFormValidation(type: StockJournalType): void {
    const controls = this.journalForm.controls;
    
    switch (type) {
      case StockJournalType.GodownTransfer:
        controls['destinationGodownId'].setValidators([Validators.required]);
        controls['manufacturingProcess'].clearValidators();
        break;
      case StockJournalType.Manufacturing:
        controls['destinationGodownId'].clearValidators();
        controls['manufacturingProcess'].setValidators([Validators.required]);
        break;
      default:
        controls['destinationGodownId'].clearValidators();
        controls['manufacturingProcess'].clearValidators();
    }
    
    controls['destinationGodownId'].updateValueAndValidity();
    controls['manufacturingProcess'].updateValueAndValidity();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.stockJournalService.getGodowns().toPromise(),
      this.stockJournalService.getProducts().toPromise()
    ]).then(([godowns, products]) => {
      this.godowns.set(godowns || []);
      this.products.set(products || []);
      this.isLoading.set(false);
      
      // Add initial rows
      this.addSourceRow();
      this.addDestinationRow();
    }).catch(() => {
      this.isLoading.set(false);
      this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
    });
  }

  addSourceRow(): void {
    this.sourceItems.update(items => [
      ...items,
      { productId: 0, productName: '', quantity: 0, rate: 0, godownId: 0, godownName: '', amount: 0 }
    ]);
  }

  addDestinationRow(): void {
    this.destinationItems.update(items => [
      ...items,
      { productId: 0, productName: '', quantity: 0, rate: 0, godownId: 0, godownName: '', amount: 0 }
    ]);
  }

  removeSourceRow(index: number): void {
    this.sourceItems.update(items => items.filter((_, i) => i !== index));
  }

  removeDestinationRow(index: number): void {
    this.destinationItems.update(items => items.filter((_, i) => i !== index));
  }

  onProductSelect(row: JournalEntryRow, productId: number, isSource: boolean): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      row.productName = product.name;
      row.rate = product.standardCost || product.salesPrice || 0;
      
      // Auto-select godown if only one exists
      if (this.godowns().length === 1) {
        row.godownId = this.godowns()[0].id;
        row.godownName = this.godowns()[0].name;
      }
      
      this.calculateAmount(row);
    }
  }

  onGodownSelect(row: JournalEntryRow, godownId: number): void {
    const godown = this.godowns().find(g => g.id === godownId);
    if (godown) {
      row.godownName = godown.name;
    }
  }

  onQuantityChange(row: JournalEntryRow): void {
    this.calculateAmount(row);
  }

  calculateAmount(row: JournalEntryRow): void {
    row.amount = row.quantity * row.rate;
  }

  saveJournal(): void {
    if (this.journalForm.invalid) {
      this.journalForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.journalForm.value;
    const type = formValue.journalType;

    // Validate items based on type
    if (type === StockJournalType.Manufacturing && this.sourceItems().length === 0) {
      this.snackBar.open('Add at least one raw material', 'Close', { duration: 3000 });
      return;
    }
    if (type === StockJournalType.GodownTransfer && this.sourceItems().length === 0) {
      this.snackBar.open('Add at least one item to transfer', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving.set(true);

    const payload = {
      voucherDate: formValue.voucherDate,
      journalType: type,
      reference: formValue.reference,
      narration: formValue.narration,
      sourceGodownId: formValue.sourceGodownId,
      destinationGodownId: formValue.destinationGodownId,
      manufacturingProcess: formValue.manufacturingProcess,
      sourceItems: this.sourceItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        godownId: item.godownId
      })),
      destinationItems: this.destinationItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        godownId: item.godownId || formValue.destinationGodownId
      }))
    };

    this.stockJournalService.create(payload).subscribe({
      next: (response) => {
        this.voucherNumber.set(response.voucherNumber);
        this.isSaving.set(false);
        this.snackBar.open(`Stock Journal created successfully! Voucher No: ${response.voucherNumber}`, 'Close', { duration: 5000 });
        
        setTimeout(() => {
          this.router.navigate(['/inventory/stock-journal']);
        }, 2000);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.snackBar.open('Failed to create Stock Journal: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory/stock-journal']);
  }

  loadJournalForEdit(id: number): void {
    this.stockJournalService.getById(id).subscribe({
      next: (journal) => {
        this.journalForm.patchValue({
          voucherDate: new Date(journal.voucherDate),
          journalType: journal.journalType,
          reference: journal.reference,
          narration: journal.narration,
          sourceGodownId: journal.sourceGodownId,
          destinationGodownId: journal.destinationGodownId,
          manufacturingProcess: journal.manufacturingProcess
        });
        
        this.selectedType.set(journal.journalType);
        
        // Load items
        if (journal.sourceItems && journal.sourceItems.length > 0) {
          this.sourceItems.set(journal.sourceItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            rate: item.rate,
            godownId: item.godownId,
            godownName: item.godownName,
            amount: item.quantity * item.rate
          })));
        }
        
        if (journal.destinationItems && journal.destinationItems.length > 0) {
          this.destinationItems.set(journal.destinationItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            rate: item.rate,
            godownId: item.godownId,
            godownName: item.godownName,
            amount: item.quantity * item.rate
          })));
        }
        
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load journal data', 'Close', { duration: 3000 });
      }
    });
  }
}
