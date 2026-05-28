import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { AccountingService } from '../../core/services/accounting.service';
import { TallyShortcutsDirective } from '../../shared/directives/tally-shortcuts.directive';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  quantity: number;
  unit: string;
  rate: number;
  value: number;
  godownId: string;
  godownName: string;
  status: 'OK' | 'LOW' | 'OUT_OF_STOCK';
  threshold: number;
  batches?: Batch[];
}

interface Batch {
  batchNo: string;
  mfgDate?: string;
  expDate?: string;
  quantity: number;
  rate: number;
}

@Component({
  selector: 'app-stock-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatDialogModule,
    MatExpansionModule,
    TallyShortcutsDirective
  ],
  templateUrl: './stock-summary.component.html',
  styleUrls: ['./stock-summary.component.css']
})
export class StockSummaryComponent implements OnInit, OnDestroy {
  stockItems: StockItem[] = [];
  filteredItems: StockItem[] = [];
  isLoading = false;
  searchQuery = '';
  selectedGodown = 'all';
  godowns: any[] = [];
  
  displayedColumns: string[] = ['name', 'sku', 'godown', 'quantity', 'unit', 'rate', 'value', 'status', 'actions'];
  
  summaryStats = {
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0
  };

  constructor(
    private accountingService: AccountingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStockSummary();
    this.loadGodowns();
  }

  ngOnDestroy(): void {}

  loadStockSummary(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.stockItems = [
        {
          id: '1',
          name: 'Laptop Dell Inspiron',
          sku: 'DELL-INS-001',
          quantity: 45,
          unit: 'Nos',
          rate: 45000,
          value: 2025000,
          godownId: '1',
          godownName: 'Main Warehouse',
          status: 'OK',
          threshold: 10
        },
        {
          id: '2',
          name: 'Wireless Mouse',
          sku: 'MOUSE-WL-002',
          quantity: 8,
          unit: 'Nos',
          rate: 500,
          value: 4000,
          godownId: '1',
          godownName: 'Main Warehouse',
          status: 'LOW',
          threshold: 15
        },
        {
          id: '3',
          name: 'USB Cable Type-C',
          sku: 'USB-TC-003',
          quantity: 0,
          unit: 'Nos',
          rate: 200,
          value: 0,
          godownId: '2',
          godownName: 'Retail Store',
          status: 'OUT_OF_STOCK',
          threshold: 50
        }
      ];
      this.filteredItems = this.stockItems;
      this.updateSummaryStats();
      this.isLoading = false;
    }, 500);
  }

  loadGodowns(): void {
    this.godowns = [
      { id: 'all', name: 'All Godowns' },
      { id: '1', name: 'Main Warehouse' },
      { id: '2', name: 'Retail Store' }
    ];
  }

  updateSummaryStats(): void {
    this.summaryStats.totalItems = this.stockItems.length;
    this.summaryStats.lowStockItems = this.stockItems.filter(i => i.status === 'LOW').length;
    this.summaryStats.outOfStockItems = this.stockItems.filter(i => i.status === 'OUT_OF_STOCK').length;
    this.summaryStats.totalValue = this.stockItems.reduce((sum, item) => sum + item.value, 0);
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredItems = this.stockItems;
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredItems = this.stockItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.barcode && item.barcode.includes(query))
    );
  }

  onGodownChange(): void {
    if (this.selectedGodown === 'all') {
      this.filteredItems = this.stockItems;
    } else {
      this.filteredItems = this.stockItems.filter(item => item.godownId === this.selectedGodown);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OK': return 'green';
      case 'LOW': return 'orange';
      case 'OUT_OF_STOCK': return 'red';
      default: return 'gray';
    }
  }

  openAdjustmentDialog(item: StockItem): void {
    console.log('Open adjustment for:', item.name);
  }

  onShortcut(action: string): void {
    console.log('Shortcut triggered:', action);
    if (action === 'F10') {
      // Open stock adjustment
    } else if (action === 'CTRL_SHIFT_I') {
      this.loadStockSummary();
    }
  }
}
