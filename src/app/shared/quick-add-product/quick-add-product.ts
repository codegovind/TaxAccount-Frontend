import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,
  FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductDto,CreateProductDto } from '../../core/models/product.model';

@Component({
  selector: 'app-quick-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quick-add-product.html',
  styleUrl: './quick-add-product.scss'
})
export class QuickAddProductComponent {
  @Output() productCreated = new EventEmitter<ProductDto>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  units = ['Nos', 'Kg', 'Gram', 'Litre', 'Ml',
    'Meter', 'Box', 'Pcs', 'Dozen'];
  gstRates = [0, 5, 12, 18, 28];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      hsnCode: [''],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      marketValue: [0],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0],
      unit: ['Nos'],
      gstPercent: [18]
    });

    // Auto fill market value and selling price from purchase price
    this.form.get('purchasePrice')?.valueChanges
      .subscribe(val => {
        if (!this.form.get('marketValue')?.dirty)
          this.form.get('marketValue')?.setValue(val,
            { emitEvent: false });
        if (!this.form.get('price')?.dirty)
          this.form.get('price')?.setValue(val,
            { emitEvent: false });
      });
  }

  onSubmit(): void {
  if (this.form.invalid) return;
  this.isSubmitting.set(true);
  this.errorMessage.set('');

  const raw = this.form.value;
  const dto: CreateProductDto = {
    name: raw.name,
    sku: '',
    hsnCode: raw.hsnCode || '',
    description: '',
    purchasePrice: +raw.purchasePrice,
    marketValue: +raw.marketValue || +raw.purchasePrice,
    price: +raw.price || +raw.purchasePrice,
    stock: +raw.stock || 0,
    unit: raw.unit || 'Nos',
    gstPercent: +raw.gstPercent
  };

  this.productService.create(dto).subscribe({
    next: (product) => {
      this.productCreated.emit(product);
      this.isSubmitting.set(false);
    },
    error: (err) => {
      this.errorMessage.set(
        err.error?.message || 'Failed to create product');
      this.isSubmitting.set(false);
    }
  });
}
}