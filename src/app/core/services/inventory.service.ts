import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Godown {
  id: number;
  name: string;
  code: string;
  address?: string;
  contactPerson?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StockBatch {
  id: number;
  productId: number;
  productName: string;
  batchNumber: string;
  godownId: number;
  godownName: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  manufacturingDate?: string;
  expiryDate?: string;
  isExpired: boolean;
  daysToExpiry?: number;
  createdAt: string;
}

export interface BatchAdjustment {
  id?: number;
  productId: number;
  fromBatchId: number;
  toBatchId?: number;
  fromGodownId: number;
  toGodownId: number;
  quantity: number;
  unit: string;
  reason: 'Transfer' | 'Damage' | 'Expiry' | 'Correction';
  notes?: string;
  adjustmentDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Godown APIs
  getGodowns(): Observable<Godown[]> {
    return this.http.get<Godown[]>(`${this.baseUrl}/inventory/godowns`);
  }

  getGodown(id: number): Observable<Godown> {
    return this.http.get<Godown>(`${this.baseUrl}/inventory/godowns/${id}`);
  }

  createGodown(godown: Omit<Godown, 'id' | 'createdAt' | 'updatedAt'>): Observable<Godown> {
    return this.http.post<Godown>(`${this.baseUrl}/inventory/godowns`, godown);
  }

  updateGodown(id: number, godown: Partial<Godown>): Observable<Godown> {
    return this.http.put<Godown>(`${this.baseUrl}/inventory/godowns/${id}`, godown);
  }

  deleteGodown(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inventory/godowns/${id}`);
  }

  // Stock Batch APIs
  getStockBatches(params?: { godownId?: number; productId?: number; includeExpired?: boolean }): Observable<StockBatch[]> {
    let httpParams = new HttpParams();
    if (params?.godownId) httpParams = httpParams.set('godownId', params.godownId.toString());
    if (params?.productId) httpParams = httpParams.set('productId', params.productId.toString());
    if (params?.includeExpired !== undefined) httpParams = httpParams.set('includeExpired', params.includeExpired.toString());
    return this.http.get<StockBatch[]>(`${this.baseUrl}/inventory/batches`, { params: httpParams });
  }

  getStockBatch(id: number): Observable<StockBatch> {
    return this.http.get<StockBatch>(`${this.baseUrl}/inventory/batches/${id}`);
  }

  createStockBatch(batch: Omit<StockBatch, 'id' | 'isExpired' | 'daysToExpiry' | 'createdAt'>): Observable<StockBatch> {
    return this.http.post<StockBatch>(`${this.baseUrl}/inventory/batches`, batch);
  }

  updateStockBatch(id: number, batch: Partial<StockBatch>): Observable<StockBatch> {
    return this.http.put<StockBatch>(`${this.baseUrl}/inventory/batches/${id}`, batch);
  }

  deleteStockBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inventory/batches/${id}`);
  }

  // Batch Adjustment APIs
  getBatchAdjustments(params?: { productId?: number; godownId?: number; fromDate?: string; toDate?: string }): Observable<BatchAdjustment[]> {
    let httpParams = new HttpParams();
    if (params?.productId) httpParams = httpParams.set('productId', params.productId.toString());
    if (params?.godownId) httpParams = httpParams.set('godownId', params.godownId.toString());
    if (params?.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params?.toDate) httpParams = httpParams.set('toDate', params.toDate);
    return this.http.get<BatchAdjustment[]>(`${this.baseUrl}/inventory/adjustments`, { params: httpParams });
  }

  createBatchAdjustment(adjustment: Omit<BatchAdjustment, 'id'>): Observable<BatchAdjustment> {
    return this.http.post<BatchAdjustment>(`${this.baseUrl}/inventory/adjustments`, adjustment);
  }

  getBatchAdjustment(id: number): Observable<BatchAdjustment> {
    return this.http.get<BatchAdjustment>(`${this.baseUrl}/inventory/adjustments/${id}`);
  }
}
