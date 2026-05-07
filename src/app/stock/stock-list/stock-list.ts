import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductDto } from '../../core/models/product.model';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.scss'
})
export class StockListComponent implements OnInit {
  inventory = signal<ProductDto[]>([]);
  isLoading = signal(true);

  constructor(
    private productService: ProductService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.inventory.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load inventory', err);
        this.isLoading.set(false);
      }
    });
  }

  // Calculates total value using AS-2 Rules: Lower of Cost or Market Value
  getTotalInventoryValue(): number {
    return this.inventory().reduce((total, item) => {
      const itemValue = item.closingStockValue || 
        (item.stock * Math.min(item.purchasePrice, item.marketValue || item.purchasePrice));
      return total + itemValue;
    }, 0);
  }
}