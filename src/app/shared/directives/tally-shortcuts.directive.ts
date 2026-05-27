import { Directive, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FastLedgerModalComponent } from '../components/fast-ledger-modal.component';

@Directive({
  selector: '[appTallyShortcuts]',
  standalone: true
})
export class TallyShortcutsDirective implements OnInit {
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    console.log('Tally Shortcuts Directive Initialized');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // F2 - Change Date (Global)
    if (event.key === 'F2') {
      event.preventDefault();
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (dateInput) {
        dateInput.focus();
        dateInput.showPicker?.();
      }
      return;
    }

    // Alt+C - Quick Create Ledger (Global)
    if (event.altKey && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      this.openFastLedgerModal();
      return;
    }

    // Ctrl+S - Save Form (Global)
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
      event.preventDefault();
      this.triggerSave();
      return;
    }

    // Esc - Cancel/Back
    if (event.key === 'Escape') {
      const activeDialog = document.querySelector('.mat-mdc-dialog-open');
      if (activeDialog) {
        const closeBtn = document.querySelector('button[mat-button][class*="cancel"]') as HTMLButtonElement;
        if (closeBtn) closeBtn.click();
      }
      return;
    }

    // F4 - Contra Voucher
    if (event.key === 'F4') {
      event.preventDefault();
      this.navigateTo('/accounting/vouchers/contra');
      return;
    }

    // F5 - Capital Entry
    if (event.key === 'F5') {
      event.preventDefault();
      this.navigateTo('/accounting/vouchers/capital');
      return;
    }

    // F6 - Tax Payment
    if (event.key === 'F6') {
      event.preventDefault();
      this.navigateTo('/accounting/vouchers/tax-payment');
      return;
    }

    // F7 - Journal Entry
    if (event.key === 'F7') {
      event.preventDefault();
      this.navigateTo('/accounting/vouchers/journal');
      return;
    }

    // F8 - Credit Note
    if (event.key === 'F8') {
      event.preventDefault();
      this.navigateTo('/sales/credit-note');
      return;
    }

    // F9 - Debit Note
    if (event.key === 'F9') {
      event.preventDefault();
      this.navigateTo('/purchases/debit-note');
      return;
    }
  }

  private openFastLedgerModal(): void {
    const dialogRef = this.dialog.open(FastLedgerModalComponent, {
      width: '500px',
      disableClose: false,
      data: { tenantId: 1 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.dispatchEvent(new CustomEvent('ledgerCreated', { detail: result }));
      }
    });
  }

  private triggerSave(): void {
    const saveBtn = document.querySelector('button[type="submit"], button.mat-raised-button[color="primary"]') as HTMLButtonElement;
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.click();
    }
  }

  private navigateTo(route: string): void {
    const currentPath = window.location.pathname;
    if (!currentPath.includes(route)) {
      window.location.href = route;
    }
  }
}
