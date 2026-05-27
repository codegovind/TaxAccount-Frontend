import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AccountingService, AccountHead } from '../../accounting/accounting.service';
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
    MatButtonModule
  ],
  template: `
    <div class="fast-ledger-modal">
      <h2 mat-dialog-title>Create New Ledger (Alt+C)</h2>
      <mat-dialog-content>
        <form #ledgerForm="ngForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ledger Name</mat-label>
            <input matInput name="name" [(ngModel)]="ledger.name" required autoFocus>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Group</mat-label>
            <select matInput name="groupId" [(ngModel)]="ledger.groupId" (change)="checkOpeningBalance()" required>
              <option *ngFor="let group of groups" [value]="group.id">{{ group.name }}</option>
            </select>
          </mat-form-field>

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

          <div class="actions">
            <button mat-button type="button" (click)="close()" class="cancel-btn">Esc - Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!ledgerForm.valid" class="save-btn">
              Ctrl+S - Save
            </button>
          </div>
        </form>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .fast-ledger-modal { min-width: 400px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .actions { display: flex; justify-content: space-between; margin-top: 20px; }
    .cancel-btn { color: #666; }
    .save-btn { background: #1976d2; color: white; }
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
  showOpeningBalance = false;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<FastLedgerModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountingService: AccountingService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
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

  checkOpeningBalance() {
    const selectedGroup = this.groups.find(g => g.id === this.ledger.groupId);
    this.showOpeningBalance = selectedGroup && 
      (selectedGroup.type === 'Asset' || selectedGroup.type === 'Liability');
  }

  onSubmit() {
    this.ledger.tenantId = this.data?.tenantId || 1;
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

  close() {
    this.dialogRef.close(null);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
