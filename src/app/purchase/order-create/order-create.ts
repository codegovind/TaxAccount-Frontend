import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule,
  FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseService } from '../../core/services/purchase.service';
import { ContactService } from '../../core/services/contact.service';
import { ProductService } from '../../core/services/product.service';
import { ContactDto } from '../../core/models/contact.model';
import { ProductDto } from '../../core/models/product.model';
import { QuickAddVendorComponent } from '../../shared/quick-add-vendor/quick-add-vendor';
import { QuickAddProductComponent } from '../../shared/quick-add-product/quick-add-product';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    QuickAddVendorComponent,
    QuickAddProductComponent
  ],
  templateUrl: './order-create.html',
  styleUrl: './order-create.scss'
})
export class OrderCreateComponent implements OnInit {
  form: FormGroup;
  vendors = signal<ContactDto[]>([]);
  products = signal<ProductDto[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal('');
  showVendorModal = signal(false);
  showProductModal = signal(false);
  currentItemIndex = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private contactService: ContactService,
    private productService: ProductService,
    public router: Router
  ) {
    this.form = this.fb.group({
      contactId: [null],
      orderDate: [
        new Date().toISOString().split('T')[0],
        Validators.required
      ],
      expectedDate: [''],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadVendors();
    this.loadProducts();
    this.addItem();
  }

  loadVendors(): void {
    this.contactService.getVendors().subscribe({
      next: (data) => this.vendors.set(data)
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data)
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  newItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0],
      discountPercent: [0],
      taxPercent: [0]
    });
  }

  addItem(): void { this.items.push(this.newItem()); }

  removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  onProductChange(index: number): void {
    const productId = this.items.at(index).get('productId')?.value;
    const product = this.products().find(p => p.id == productId);
    if (product) {
      this.items.at(index).patchValue({
        description: product.name,
        unitPrice: product.purchasePrice || product.price,
        taxPercent: product.gstPercent
      });
    }
  }

  openVendorModal(): void { this.showVendorModal.set(true); }

  openProductModal(index: number): void {
    this.currentItemIndex.set(index);
    this.showProductModal.set(true);
  }

  onVendorCreated(vendor: ContactDto): void {
    this.vendors.update(v => [...v, vendor]);
    this.form.patchValue({ contactId: vendor.id });
    this.showVendorModal.set(false);
  }

  onProductCreated(product: ProductDto): void {
    this.products.update(p => [...p, product]);
    const index = this.currentItemIndex();
    if (index !== null) {
      this.items.at(index).patchValue({
        productId: product.id,
        description: product.name,
        unitPrice: product.purchasePrice || product.price,
        taxPercent: product.gstPercent
      });
    }
    this.showProductModal.set(false);
    this.currentItemIndex.set(null);
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index).value;
    const sub = item.quantity * item.unitPrice;
    const disc = sub * (item.discountPercent / 100);
    const taxable = sub - disc;
    return taxable + taxable * (item.taxPercent / 100);
  }

  getSubTotal(): number {
    return this.items.controls
      .reduce((s, i) => s + i.value.quantity * i.value.unitPrice, 0);
  }

  getTotalTax(): number {
    return this.items.controls.reduce((s, i) => {
      const sub = i.value.quantity * i.value.unitPrice;
      const disc = sub * (i.value.discountPercent / 100);
      return s + (sub - disc) * (i.value.taxPercent / 100);
    }, 0);
  }

  getGrandTotal(): number {
    return this.items.controls.reduce((s, i) => {
      const sub = i.value.quantity * i.value.unitPrice;
      const disc = sub * (i.value.discountPercent / 100);
      const taxable = sub - disc;
      return s + taxable + taxable * (i.value.taxPercent / 100);
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const v = this.form.value;
    const dto = {
      contactId: v.contactId ? +v.contactId : undefined,
      orderDate: v.orderDate,
      expectedDate: v.expectedDate || undefined,
      notes: v.notes,
      items: v.items.map((i: any) => ({
        ...i, productId: +i.productId
      }))
    };

    this.purchaseService.createOrder(dto).subscribe({
      next: () => this.router.navigate(['/purchase/orders']),
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Failed to create order');
        this.isSubmitting.set(false);
      }
    });
  }
}