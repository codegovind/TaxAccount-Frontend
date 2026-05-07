import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.html'
})
export class ContactListComponent implements OnInit {
  contacts = signal<any[]>([]);
  isLoading = signal(true);

  constructor(private contactService: ContactService, public router: Router) {}

  ngOnInit(): void {
    this.contactService.getAll().subscribe({
      next: (data) => {
        this.contacts.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getContactTypeLabel(type: number): string {
    if (type === 1) return 'Customer';
    if (type === 2) return 'Vendor';
    return 'Both';
  }
}