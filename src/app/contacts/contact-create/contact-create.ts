import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-create.html',
  styleUrl: './contact-create.scss'
})
export class ContactCreateComponent implements OnInit {
  contactForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  contactId = signal<number | null>(null);

  indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      gstin: [''],              // ← correct field name
      gstType: [2],             // ← number default (Unregistered)
      contactType: [1],         // ← number default (Customer)
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      pinCode: [''],
      openingBalance: [0]
      // NO email field
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.contactId.set(+id);
      this.loadContact(+id);
    }
  }

  loadContact(id: number): void {
    this.isLoading.set(true);
    this.contactService.getById(id).subscribe({
      next: (contact) => {
        this.contactForm.patchValue({
          name: contact.name,
          gstin: contact.gstin || '',
          gstType: this.getGstTypeValue(contact.gstType),
          contactType: this.getContactTypeValue(contact.contactType),
          phone: contact.phone || '',
          address: contact.address || '',
          city: contact.city || '',
          state: contact.state || '',
          pinCode: contact.pinCode || '',
          openingBalance: contact.openingBalance
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/contacts']);
      }
    });
  }

  getGstTypeValue(type: string): number {
    const map: Record<string, number> = {
      'Registered': 1,
      'Unregistered': 2,
      'Composition': 3,
      'Consumer': 4
    };
    return map[type] ?? 2;
  }

  getContactTypeValue(type: string): number {
    const map: Record<string, number> = {
      'Customer': 1,
      'Vendor': 2,
      'Both': 3
    };
    return map[type] ?? 1;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    // Ensure numbers are sent as numbers not strings
    const rawValue = this.contactForm.value;
    const dto = {
      name: rawValue.name,
      gstin: rawValue.gstin || undefined,
      gstType: +rawValue.gstType,        // ← force number
      contactType: +rawValue.contactType, // ← force number
      phone: rawValue.phone || undefined,
      address: rawValue.address || undefined,
      city: rawValue.city || undefined,
      state: rawValue.state || undefined,
      pinCode: rawValue.pinCode || undefined,
      openingBalance: +rawValue.openingBalance
    };

    if (this.isEditMode() && this.contactId()) {
      const updateDto = { ...dto, isActive: true };
      this.contactService.update(
        this.contactId()!, updateDto as any).subscribe({
        next: () => this.router.navigate(['/contacts']),
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Update failed');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.contactService.create(dto).subscribe({
        next: () => this.router.navigate(['/contacts']),
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Create failed');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  get f() { return this.contactForm.controls; }
}