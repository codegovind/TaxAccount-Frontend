import { Directive, HostListener, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[appTallyShortcuts]',
  standalone: true
})
export class TallyShortcutsDirective {
  @Output() shortcutTriggered = new EventEmitter<string>();
  @Input() enableDateChange = true;
  @Input() enableSave = true;
  @Input() enableCancel = true;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // F2 - Change Date
    if (this.enableDateChange && event.key === 'F2') {
      event.preventDefault();
      this.shortcutTriggered.emit('CHANGE_DATE');
    }

    // Ctrl+S - Save
    if (this.enableSave && event.ctrlKey && event.key === 's') {
      event.preventDefault();
      this.shortcutTriggered.emit('SAVE');
    }

    // Esc - Cancel/Back
    if (this.enableCancel && event.key === 'Escape') {
      event.preventDefault();
      this.shortcutTriggered.emit('CANCEL');
    }

    // Alt+C - Quick Create (will be used in Step 2)
    if (event.altKey && event.key === 'c') {
      event.preventDefault();
      this.shortcutTriggered.emit('QUICK_CREATE');
    }

    // F4-F9 - Voucher Shortcuts (will be used in Steps 3-6)
    if (event.key === 'F4') {
      event.preventDefault();
      this.shortcutTriggered.emit('CONTRA_VOUCHER');
    }
    if (event.key === 'F5') {
      event.preventDefault();
      this.shortcutTriggered.emit('CAPITAL_VOUCHER');
    }
    if (event.key === 'F6') {
      event.preventDefault();
      this.shortcutTriggered.emit('TAX_PAYMENT');
    }
    if (event.key === 'F7') {
      event.preventDefault();
      this.shortcutTriggered.emit('JOURNAL_VOUCHER');
    }
    if (event.key === 'F8') {
      event.preventDefault();
      this.shortcutTriggered.emit('CREDIT_NOTE');
    }
    if (event.key === 'F9') {
      event.preventDefault();
      this.shortcutTriggered.emit('DEBIT_NOTE');
    }
  }
}
