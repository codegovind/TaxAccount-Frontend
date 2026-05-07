import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { StockService } from '../../core/services/stock.service';
import { ProductDto } from '../../core/models/product.model';

@Component({
  selector: 'app-stock-adjust',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-adjust.html'
})
export class StockAdjustComponent implements OnInit {
  adjustForm: FormGroup;
  
  products = signal<ProductDto[]>([]);
  selectedProduct = signal<ProductDto | null>(null);
  
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  reasonCodes = [
    'Physical Audit Correction',
    'Damaged / Broken Goods',
    'Theft / Missing',
    'Promotional Giveaway',
    'Internal Consumption',
    'AS-2 Devaluation / Write-off'
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private stockService: StockService,
    public router: Router
  ) {
    this.adjustForm = this.fb.group({
      productId: ['', Validators.required],
      adjustmentType: ['Deduct', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      reasonCode: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onProductSelect(): void {
    const id = this.adjustForm.get('productId')?.value;
    const product = this.products().find(p => p.id == id);
    this.selectedProduct.set(product || null);
  }

  getNewStockPreview(): number {
    if (!this.selectedProduct()) return 0;
    
    const currentStock = this.selectedProduct()!.stock;
    const type = this.adjustForm.get('adjustmentType')?.value;
    const qty = this.adjustForm.get('quantity')?.value || 0;

    return type === 'Add' ? currentStock + qty : currentStock - qty;
  }

  isNegativeStock(): boolean {
    return this.getNewStockPreview() < 0;
  }

  onSubmit(): void {
    if (this.adjustForm.invalid || this.isNegativeStock()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.stockService.adjustStock(this.adjustForm.value).subscribe({
      next: () => this.router.navigate(['/stock']),
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to record adjustment');
        this.isSubmitting.set(false);
      }
    });
  }
}