import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { InventoryService, Godown } from '../../core/services/inventory.service';
import { GodownFormComponent } from './godown-form.component';

@Component({
  selector: 'app-godown-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './godown-list.component.html',
  styleUrls: ['./godown-list.component.scss']
})
export class GodownListComponent implements OnInit {
  godowns = signal<Godown[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  displayedColumns: string[] = ['code', 'name', 'address', 'contactPerson', 'contactNumber', 'isActive', 'actions'];

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadGodowns();
  }

  loadGodowns(): void {
    this.loading.set(true);
    this.inventoryService.getGodowns().subscribe({
      next: (data) => {
        this.godowns.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading godowns:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(GodownFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGodowns();
      }
    });
  }

  openEditDialog(godown: Godown): void {
    const dialogRef = this.dialog.open(GodownFormComponent, {
      width: '600px',
      data: { mode: 'edit', godown }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGodowns();
      }
    });
  }

  deleteGodown(godown: Godown): void {
    if (confirm(`Are you sure you want to delete godown "${godown.name}"?`)) {
      this.inventoryService.deleteGodown(godown.id).subscribe({
        next: () => {
          this.loadGodowns();
        },
        error: (error) => {
          console.error('Error deleting godown:', error);
          alert('Failed to delete godown. It may be in use.');
        }
      });
    }
  }

  getFilteredGodowns(): Godown[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.godowns();
    }
    return this.godowns().filter(g =>
      g.name.toLowerCase().includes(query) ||
      g.code.toLowerCase().includes(query) ||
      g.address?.toLowerCase().includes(query)
    );
  }
}
