import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductDto, CreateProductDto, UpdateProductDto } from '../../core/models/product.model';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-create.html'
})
export class ProductCreateComponent implements OnInit {
  productForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  productId = signal<number | null>(null);

  units = ['Nos', 'Kg', 'Gram', 'Litre', 'Ml', 'Meter', 'Box', 'Pcs', 'Dozen', 'Set'];
  gstRates = [0, 5, 12, 18, 28];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public router: Router, // Changed to public for HTML access
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: [''],
      hsnCode: [''],
      description: [''],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      marketValue: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      unit: ['Nos', Validators.required],
      gstPercent: [18, Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
  if (this.productForm.invalid) return;
  this.isSubmitting.set(true);
  this.errorMessage.set('');

  const raw = this.productForm.value;

  // Ensure all numbers are numbers not strings
  const dto: CreateProductDto = {
    name: raw.name,
    sku: raw.sku || '',
    hsnCode: raw.hsnCode || '',
    description: raw.description || '',
    purchasePrice: +raw.purchasePrice,
    marketValue: +raw.marketValue || +raw.purchasePrice,
    price: +raw.price,
    stock: +raw.stock,
    unit: raw.unit || 'Nos',
    gstPercent: +raw.gstPercent
  };

  if (this.isEditMode() && this.productId()) {
    const updateDto: UpdateProductDto = {
      ...dto,
      isActive: true
    };
    this.productService.update(this.productId()!, updateDto)
      .subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Update failed');
          this.isSubmitting.set(false);
        }
      });
  } else {
    this.productService.create(dto).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Create failed');
        this.isSubmitting.set(false);
      }
    });
  }
}

  get f() { return this.productForm.controls; }
}