import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { StockJournalService, StockJournalDto } from '../../core/services/stock-journal.service';

@Component({
  selector: 'app-stock-journal-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './stock-journal-detail.component.html',
  styleUrls: ['./stock-journal-detail.component.scss']
})
export class StockJournalDetailComponent implements OnInit {
  journal = signal<StockJournalDto | null>(null);
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockJournalService: StockJournalService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadJournal(+id);
    } else {
      this.isLoading.set(false);
      this.snackBar.open('Invalid journal ID', 'Close', { duration: 3000 });
      this.router.navigate(['/inventory/stock-journal']);
    }
  }

  loadJournal(id: number): void {
    this.isLoading.set(true);
    this.stockJournalService.getById(id).subscribe({
      next: (data) => {
        this.journal.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load journal details', 'Close', { duration: 3000 });
        this.router.navigate(['/inventory/stock-journal']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/stock-journal']);
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
