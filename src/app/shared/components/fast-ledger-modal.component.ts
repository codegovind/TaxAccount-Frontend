import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AccountingService, AccountHead } from '../../core/services/accounting.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-fast-ledger-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="fast-ledger-modal">
      <h2 mat-dialog-title>Create New Ledger (Alt+C)</h2>
      <mat-dialog-content>
        <form #ledgerForm="ngForm" (ngSubmit)="onSubmit()">
          <!-- Ledger Name with Type-ahead Search -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ledger Name</mat-label>
            <input matInput name="name" [(ngModel)]="ledger.name" required autoFocus
                   [matAutocomplete]="auto" (input)="filterLedgers()" 
                   placeholder="Start typing to search existing ledgers...">
            <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onLedgerSelected($event.option.value)">
              <mat-option *ngFor="let ledger of filteredLedgers" [value]="ledger">
                {{ ledger.name }} ({{ ledger.type }})
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>

          <!-- Group Selection -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Group</mat-label>
            <select matInput name="groupId" [(ngModel)]="ledger.groupId" (change)="checkOpeningBalance()" required>
              <option *ngFor="let group of groups" [value]="group.id">{{ group.name }}</option>
            </select>
          </mat-form-field>

          <!-- Opening Balance (Conditional) -->
          <mat-form-field appearance="outline" class="full-width" *ngIf="showOpeningBalance">
            <mat-label>Opening Balance</mat-label>
            <input matInput type="number" name="openingBalance" [(ngModel)]="ledger.openingBalance">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" *ngIf="showOpeningBalance">
            <mat-label>Balance Type</mat-label>
            <select matInput name="balanceType" [(ngModel)]="ledger.balanceType">
              <option value="Dr">Debit</option>
              <option value="Cr">Credit</option>
            </select>
          </mat-form-field>

          <!-- Action Buttons with Shortcuts -->
          <div class="actions">
            <button mat-button type="button" (click)="close()" class="cancel-btn">Esc - Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!ledgerForm.valid || !ledger.name?.trim()" class="save-btn">
              Ctrl+S - Save
            </button>
          </div>
        </form>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .fast-ledger-modal { min-width: 450px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .actions { display: flex; justify-content: space-between; margin-top: 20px; }
    .cancel-btn { color: #666; }
    .save-btn { background: #1976d2; color: white; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class FastLedgerModalComponent implements OnInit, OnDestroy {
  ledger: any = {
    name: '',
    groupId: null,
    openingBalance: 0,
    balanceType: 'Dr',
    tenantId: 0
  };

  groups: any[] = [];
  allLedgers: AccountHead[] = [];
  filteredLedgers: AccountHead[] = [];
  showOpeningBalance = false;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<FastLedgerModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountingService: AccountingService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadAllLedgers();
  }

  loadGroups() {
    this.accountingService.getChartOfAccounts().subscribe({
      next: (accounts) => {
        this.groups = accounts.filter(a => !a.parentId);
        if (this.data && this.data.preferredGroupId) {
          this.ledger.groupId = this.data.preferredGroupId;
          this.checkOpeningBalance();
        }
      },
      error: (err) => console.error('Error loading groups', err)
    });
  }

  loadAllLedgers() {
    this.accountingService.getChartOfAccounts().subscribe({
      next: (accounts) => {
        this.allLedgers = accounts;
        this.filteredLedgers = accounts;
      },
      error: (err) => console.error('Error loading ledgers', err)
    });
  }

  filterLedgers() {
    const searchTerm = this.ledger.name?.toLowerCase() || '';
    if (searchTerm.length === 0) {
      this.filteredLedgers = this.allLedgers;
    } else {
      this.filteredLedgers = this.allLedgers.filter(l => 
        l.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  onLedgerSelected(selectedLedger: AccountHead) {
    // If user selects an existing ledger, close modal with that ledger
    this.dialogRef.close(selectedLedger);
  }

  checkOpeningBalance() {
    const selectedGroup = this.groups.find(g => g.id === this.ledger.groupId);
    this.showOpeningBalance = selectedGroup && 
      (selectedGroup.type === 'Asset' || selectedGroup.type === 'Liability');
  }

  onSubmit() {
    // Check if name is empty or whitespace
    if (!this.ledger.name?.trim()) {
      alert('Please enter a ledger name');
      return;
    }

    // Check if ledger already exists
    const existingLedger = this.allLedgers.find(l => 
      l.name.toLowerCase() === this.ledger.name.trim().toLowerCase()
    );
    
    if (existingLedger) {
      alert('A ledger with this name already exists!');
      return;
    }

    this.ledger.tenantId = this.data?.tenantId || 1;
    this.ledger.code = this.generateCode(this.ledger.name);
    this.ledger.type = this.groups.find(g => g.id === this.ledger.groupId)?.type || 'Asset';
    
    this.accountingService.createAccount(this.ledger).subscribe({
      next: (created) => {
        this.dialogRef.close(created);
      },
      error: (err) => {
        console.error('Error creating ledger', err);
        alert('Error creating ledger. Please try again.');
      }
    });
  }

  generateCode(name: string): string {
    // Generate a simple code from the name
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${prefix}${randomNum.toString().padStart(3, '0')}`;
  }

  close() {
    this.dialogRef.close(null);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
