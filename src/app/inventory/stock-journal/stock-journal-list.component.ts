import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StockJournalService, StockJournalDto, StockJournalType } from '../../core/services/stock-journal.service';

@Component({
  selector: 'app-stock-journal-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './stock-journal-list.component.html',
  styleUrls: ['./stock-journal-list.component.scss']
})
export class StockJournalListComponent implements OnInit {
  journals = signal<StockJournalDto[]>([]);
  isLoading = signal(true);
  
  displayedColumns = ['voucherNumber', 'voucherDate', 'journalType', 'reference', 'sourceGodown', 'destinationGodown', 'actions'];
  
  // Filters
  filterType = signal<string>('');
  filterStartDate = signal<Date | null>(null);
  filterEndDate = signal<Date | null>(null);
  filterGodownId = signal<number | null>(null);
  
  journalTypes = ['', ...Object.values(StockJournalType)];
  godowns = signal<any[]>([]);

  constructor(
    private stockJournalService: StockJournalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJournals();
    this.loadGodowns();
  }

  loadJournals(): void {
    this.isLoading.set(true);
    
    this.stockJournalService.getAll(
      this.filterType() || undefined,
      this.filterStartDate(),
      this.filterEndDate(),
      this.filterGodownId() || undefined
    ).subscribe({
      next: (data) => {
        this.journals.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load stock journals', 'Close', { duration: 3000 });
      }
    });
  }

  loadGodowns(): void {
    this.stockJournalService.getGodowns().subscribe({
      next: (data) => {
        this.godowns.set(data);
      },
      error: () => {
        // Silently fail, godown filter is optional
      }
    });
  }

  applyFilters(): void {
    this.loadJournals();
  }

  clearFilters(): void {
    this.filterType.set('');
    this.filterStartDate.set(null);
    this.filterEndDate.set(null);
    this.filterGodownId.set(null);
    this.loadJournals();
  }

  createNew(): void {
    this.router.navigate(['/inventory/stock-journal/new']);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/inventory/stock-journal', id]);
  }

  deleteJournal(id: number, voucherNumber: string): void {
    const confirmDelete = confirm(`Are you sure you want to delete Stock Journal ${voucherNumber}? This will reverse all stock adjustments.`);
    
    if (confirmDelete) {
      this.stockJournalService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Stock Journal deleted successfully', 'Close', { duration: 3000 });
          this.loadJournals();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  getJournalTypeLabel(type: string): string {
    switch (type) {
      case 'Manufacturing': return 'Manufacturing';
      case 'GodownTransfer': return 'Godown Transfer';
      case 'MaterialIssue': return 'Material Issue';
      case 'MaterialReceipt': return 'Material Receipt';
      case 'ScrapAdjustment': return 'Scrap Adjustment';
      default: return type;
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Manufacturing': return 'accent';
      case 'GodownTransfer': return 'primary';
      case 'MaterialIssue': return 'warn';
      case 'ScrapAdjustment': return 'warn';
      default: return 'basic';
    }
  }
}
