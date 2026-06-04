import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { InventoryService, BatchAdjustment, StockBatch, Godown } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-batch-adjustment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    DatePipe
  ],
  templateUrl: './batch-adjustment.component.html',
  styleUrls: ['./batch-adjustment.component.scss']
})
export class BatchAdjustmentComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  
  products = signal<any[]>([]);
  batches = signal<StockBatch[]>([]);
  godowns = signal<Godown[]>([]);
  adjustments = signal<BatchAdjustment[]>([]);

  reasonOptions = [
    { value: 'Transfer', label: 'Transfer' },
    { value: 'Damage', label: 'Damage' },
    { value: 'Expiry', label: 'Expiry' },
    { value: 'Correction', label: 'Correction' }
  ];

  displayedColumns: string[] = ['adjustmentDate', 'productName', 'fromGodown', 'toGodown', 'quantity', 'reason', 'notes'];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      productId: [null, [Validators.required]],
      fromBatchId: [null, [Validators.required]],
      toBatchId: [null],
      fromGodownId: [null, [Validators.required]],
      toGodownId: [null, [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      unit: ['', [Validators.required]],
      reason: ['Transfer', [Validators.required]],
      notes: [''],
      adjustmentDate: [new Date(), [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadGodowns();
    this.loadAdjustments();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadGodowns(): void {
    this.inventoryService.getGodowns().subscribe({
      next: (data) => {
        this.godowns.set(data);
      },
      error: (error) => {
        console.error('Error loading godowns:', error);
      }
    });
  }

  onProductChange(): void {
    const productId = this.form.get('productId')?.value;
    if (productId) {
      this.loading.set(true);
      this.inventoryService.getStockBatches({ productId }).subscribe({
        next: (data) => {
          this.batches.set(data);
          this.loading.set(false);
          
          // Auto-fill unit from first batch
          if (data.length > 0) {
            this.form.patchValue({ unit: data[0].unit });
          }
        },
        error: (error) => {
          console.error('Error loading batches:', error);
          this.loading.set(false);
        }
      });
    }
  }

  loadAdjustments(): void {
    this.inventoryService.getBatchAdjustments().subscribe({
      next: (data) => {
        this.adjustments.set(data);
      },
      error: (error) => {
        console.error('Error loading adjustments:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formData = this.form.value;
    
    // Format date
    if (formData.adjustmentDate) {
      formData.adjustmentDate = formData.adjustmentDate.toISOString().split('T')[0];
    }

    this.inventoryService.createBatchAdjustment(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset({
          productId: null,
          fromBatchId: null,
          toBatchId: null,
          fromGodownId: null,
          toGodownId: null,
          quantity: null,
          unit: '',
          reason: 'Transfer',
          notes: '',
          adjustmentDate: new Date()
        });
        this.batches.set([]);
        this.loadAdjustments();
        alert('Batch adjustment created successfully!');
      },
      error: (error) => {
        console.error('Error creating adjustment:', error);
        this.submitting.set(false);
        alert('Failed to create batch adjustment');
      }
    });
  }

  getGodownName(id: number): string {
    const godown = this.godowns().find(g => g.id === id);
    return godown ? godown.name : 'Unknown';
  }

  getProductName(id: number): string {
    const product = this.products().find(p => p.id === id);
    return product ? product.name : 'Unknown';
  }
}
