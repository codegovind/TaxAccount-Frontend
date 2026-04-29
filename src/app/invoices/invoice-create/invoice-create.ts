import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.scss'
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  userName = signal('');
  //userRole = signal('');
  products = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      dueDate: ['', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.fullName || '');
    //this.userRole.set(user?.role || '');
    this.loadProducts();
    this.addItem();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.log('Error loading products:', err)
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  newItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      taxPercent: [18]
    });
  }

  addItem(): void {
    this.items.push(this.newItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onProductChange(index: number): void {
    const productId = this.items.at(index).get('productId')?.value;
    const product = this.products().find(p => p.id == productId);
    if (product) {
      this.items.at(index).patchValue({
        description: product.name,
        unitPrice: product.price
      });
    }
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index).value;
    const subTotal = item.quantity * item.unitPrice;
    const tax = subTotal * (item.taxPercent / 100);
    return subTotal + tax;
  }

  getSubTotal(): number {
    return this.items.controls.reduce((sum, item) => {
      return sum + (item.value.quantity * item.value.unitPrice);
    }, 0);
  }

  getTotalTax(): number {
    return this.items.controls.reduce((sum, item) => {
      const subTotal = item.value.quantity * item.value.unitPrice;
      return sum + (subTotal * (item.value.taxPercent / 100));
    }, 0);
  }

  getGrandTotal(): number {
    return this.getSubTotal() + this.getTotalTax();
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.invoiceService.create(this.invoiceForm.value).subscribe({
      next: (invoice) => {
        this.router.navigate(['/invoices', invoice.id]);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create invoice');
        this.isSubmitting.set(false);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/auth/login']);
  // }
}