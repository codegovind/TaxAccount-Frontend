import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule,
  FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../core/services/purchase.service';
import { ContactService } from '../../core/services/contact.service';
import { ProductService } from '../../core/services/product.service';
import { ContactDto, CreateContactDto } from '../../core/models/contact.model';
import { ProductDto } from '../../core/models/product.model';
import { QuickAddVendorComponent } from '../../shared/quick-add-vendor/quick-add-vendor';
import { QuickAddProductComponent } from '../../shared/quick-add-product/quick-add-product';

@Component({
  selector: 'app-purchase-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    QuickAddVendorComponent,
    QuickAddProductComponent
  ],
  templateUrl: './purchase-create.html',
  styleUrl: './purchase-create.scss'
})
export class PurchaseCreateComponent implements OnInit {
  form: FormGroup;
  vendors = signal<ContactDto[]>([]);
  products = signal<ProductDto[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal('');
  isOrderMode = signal(false);

  // Modal flags
  showVendorModal = signal(false);
  showProductModal = signal(false);
  currentItemIndex = signal<number | null>(null);

  paymentMethods = [
    { value: 1, label: 'Cash' },
    { value: 2, label: 'UPI' },
    { value: 3, label: 'Bank Transfer' },
    { value: 4, label: 'Credit' }
  ];

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private contactService: ContactService,
    private productService: ProductService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      contactId: [null],
      billDate: [
        new Date().toISOString().split('T')[0]
      ],
      dueDate: [''],
      vendorBillNumber: [''],
      orderDate: [new Date().toISOString().split('T')[0]],
      expectedDate: [''],
      paymentMethod: [4],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Check if order mode from query param
    this.route.queryParams.subscribe(params => {
      this.isOrderMode.set(params['type'] === 'order');
    });

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

  addItem(): void {
    this.items.push(this.newItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1)
      this.items.removeAt(index);
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

  // Open vendor modal
  openVendorModal(): void {
    this.showVendorModal.set(true);
  }

  // Open product modal for specific item row
  openProductModal(index: number): void {
    this.currentItemIndex.set(index);
    this.showProductModal.set(true);
  }

  // Handle new vendor created
  onVendorCreated(vendor: ContactDto): void {
    this.vendors.update(v => [...v, vendor]);
    this.form.patchValue({ contactId: vendor.id });
    this.showVendorModal.set(false);
  }

  // Handle new product created
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

  getItemSubTotal(index: number): number {
    const item = this.items.at(index).value;
    const subTotal = item.quantity * item.unitPrice;
    const discount = subTotal * (item.discountPercent / 100);
    const taxable = subTotal - discount;
    const tax = taxable * (item.taxPercent / 100);
    return taxable + tax;
  }

  getSubTotal(): number {
    return this.items.controls.reduce((sum, item) => {
      return sum + (item.value.quantity * item.value.unitPrice);
    }, 0);
  }

  getTotalDiscount(): number {
    return this.items.controls.reduce((sum, item) => {
      const subTotal = item.value.quantity * item.value.unitPrice;
      return sum + (subTotal * (item.value.discountPercent / 100));
    }, 0);
  }

  getTotalTax(): number {
    return this.items.controls.reduce((sum, item) => {
      const subTotal = item.value.quantity * item.value.unitPrice;
      const discount = subTotal * (item.value.discountPercent / 100);
      const taxable = subTotal - discount;
      return sum + (taxable * (item.value.taxPercent / 100));
    }, 0);
  }

  getGrandTotal(): number {
    return this.getSubTotal() - this.getTotalDiscount() +
      this.getTotalTax();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.form.value;
    const contactId = formValue.contactId
      ? +formValue.contactId : undefined;

    if (this.isOrderMode()) {
      const dto = {
        contactId,
        orderDate: formValue.orderDate,
        expectedDate: formValue.expectedDate || undefined,
        notes: formValue.notes,
        items: formValue.items.map((i: any) => ({
          ...i, productId: +i.productId
        }))
      };

      this.purchaseService.createOrder(dto).subscribe({
        next: (order) => {
          this.router.navigate(['/purchase/orders']);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Failed to create order');
          this.isSubmitting.set(false);
        }
      });
    } else {
      const dto = {
        contactId,
        billDate: formValue.billDate,
        dueDate: formValue.dueDate || undefined,
        vendorBillNumber: formValue.vendorBillNumber,
        paymentMethod: +formValue.paymentMethod,
        notes: formValue.notes,
        items: formValue.items.map((i: any) => ({
          ...i, productId: +i.productId
        }))
      };

      this.purchaseService.createBill(dto).subscribe({
        next: (bill) => {
          this.router.navigate(['/purchase', bill.id]);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Failed to create bill');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}