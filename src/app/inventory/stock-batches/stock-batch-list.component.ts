import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryService, StockBatch } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-stock-batch-list',
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
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './stock-batch-list.component.html',
  styleUrls: ['./stock-batch-list.component.scss']
})
export class StockBatchListComponent implements OnInit {
  batches = signal<StockBatch[]>([]);
  products = signal<any[]>([]);
  loading = signal(false);
  
  filters = signal({
    godownId: null as number | null,
    productId: null as number | null,
    includeExpired: false
  });

  displayedColumns: string[] = ['batchNumber', 'productName', 'godownName', 'quantity', 'unit', 'purchasePrice', 'sellingPrice', 'expiryDate', 'status', 'actions'];

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBatches();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadBatches(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.filters().productId) params.productId = this.filters().productId;
    if (this.filters().includeExpired !== undefined) params.includeExpired = this.filters().includeExpired;

    this.inventoryService.getStockBatches(params).subscribe({
      next: (data) => {
        this.batches.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading batches:', error);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.loadBatches();
  }

  getDaysToExpiryClass(batch: StockBatch): string {
    if (batch.isExpired) return 'expired';
    if (batch.daysToExpiry && batch.daysToExpiry <= 30) return 'expiring-soon';
    if (batch.daysToExpiry && batch.daysToExpiry <= 90) return 'expiring-medium';
    return 'valid';
  }

  deleteBatch(batch: StockBatch): void {
    if (confirm(`Are you sure you want to delete batch "${batch.batchNumber}"?`)) {
      this.inventoryService.deleteStockBatch(batch.id).subscribe({
        next: () => {
          this.loadBatches();
        },
        error: (error) => {
          console.error('Error deleting batch:', error);
          alert('Failed to delete batch. It may be in use.');
        }
      });
    }
  }
}
