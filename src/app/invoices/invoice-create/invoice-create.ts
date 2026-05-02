import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactService } from '../../core/services/contact.service';

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
  
  products = signal<any[]>([]);
  contacts = signal<any[]>([]);
  
  tenantState = signal('Maharashtra'); // The base state for GST math

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private authService: AuthService,
    private contactService: ContactService,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      invoiceType: [1, Validators.required],   // 1 = Sale
      paymentMethod: [1, Validators.required], // 1 = Cash
      entrySource: [1],                        // 1 = Full Accounting
      contactId: [null],                       // null = Cash Sale / Walk-in
      invoiceDate: [new Date().toISOString().substring(0, 10), Validators.required],
      dueDate: [new Date().toISOString().substring(0, 10), Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadContacts();
    this.addItem();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Error loading products:', err)
    });
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe({
      next: (data) => this.contacts.set(data),
      error: (err) => console.error('Error loading contacts:', err)
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
      taxPercent: [18],
      discountPercent: [0] 
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
        unitPrice: product.price,
        taxPercent: product.gstPercent || 18
      });
    }
  }

  // --- GST Math Logic ---
  calculateItemTaxes(item: any): { cgst: number, sgst: number, igst: number, totalTax: number } {
    const subTotal = item.quantity * item.unitPrice;
    const discountAmount = subTotal * (item.discountPercent / 100);
    const taxableValue = subTotal - discountAmount;
    
    const selectedContactId = this.invoiceForm.get('contactId')?.value;
    const contact = this.contacts().find(c => c.id == selectedContactId);
    
    // If Cash Sale (no contact) OR states match = Local Sale (CGST + SGST)
    const isInterState = contact && contact.state && 
      contact.state.toLowerCase() !== this.tenantState().toLowerCase();

    let cgst = 0, sgst = 0, igst = 0;

    if (isInterState) {
      igst = parseFloat((taxableValue * (item.taxPercent / 100)).toFixed(2));
    } else {
      const halfRate = item.taxPercent / 2;
      cgst = parseFloat((taxableValue * (halfRate / 100)).toFixed(2));
      sgst = parseFloat((taxableValue * (halfRate / 100)).toFixed(2));
    }

    return { cgst, sgst, igst, totalTax: cgst + sgst + igst };
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index).value;
    const subTotal = item.quantity * item.unitPrice;
    const discountAmount = subTotal * (item.discountPercent / 100);
    const taxableValue = subTotal - discountAmount;
    const taxes = this.calculateItemTaxes(item);
    
    return taxableValue + taxes.totalTax;
  }

  getSubTotal(): number {
    return this.items.controls.reduce((sum, itemCtrl) => {
      const item = itemCtrl.value;
      const subTotal = item.quantity * item.unitPrice;
      const discountAmount = subTotal * (item.discountPercent / 100);
      return sum + (subTotal - discountAmount);
    }, 0);
  }

  getTotalTax(): number {
    return this.items.controls.reduce((sum, itemCtrl) => {
      return sum + this.calculateItemTaxes(itemCtrl.value).totalTax;
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
}