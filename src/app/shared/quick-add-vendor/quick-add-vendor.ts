import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,
  FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { ContactDto,CreateContactDto } from '../../core/models/contact.model';

@Component({
  selector: 'app-quick-add-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quick-add-vendor.html',
  styleUrl: './quick-add-vendor.scss'
})
export class QuickAddVendorComponent {
  @Output() vendorCreated = new EventEmitter<ContactDto>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  indianStates = [
    'Andhra Pradesh', 'Gujarat', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
    'Delhi', 'Goa', 'Bihar', 'Haryana'
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      gstin: [''],
      gstType: [1],
      contactType: [2], // Default Vendor
      phone: [''],
      state: [''],
      openingBalance: [0]
    });
  }

  onSubmit(): void {
  if (this.form.invalid) return;
  this.isSubmitting.set(true);
  this.errorMessage.set('');

  const rawValue = this.form.value;
  const dto = {
    name: rawValue.name,
    gstin: rawValue.gstin || undefined,
    gstType: +rawValue.gstType,         // ← force number
    contactType: +rawValue.contactType, // ← force number
    phone: rawValue.phone || undefined,
    state: rawValue.state || undefined,
    openingBalance: 0
  };

  this.contactService.create(dto).subscribe({
    next: (vendor) => {
      this.vendorCreated.emit(vendor);
      this.isSubmitting.set(false);
    },
    error: (err) => {
      this.errorMessage.set(
        err.error?.message || 'Failed to create vendor');
      this.isSubmitting.set(false);
    }
  });
}
}