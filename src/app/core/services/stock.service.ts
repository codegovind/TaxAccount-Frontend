import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StockAdjustmentDto {
  productId: number;
  adjustmentType: 'Add' | 'Deduct';
  quantity: number;
  reasonCode: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = `${environment.apiUrl}/stock`;

  constructor(private http: HttpClient) {}

  adjustStock(payload: StockAdjustmentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/adjust`, payload);
  }
}