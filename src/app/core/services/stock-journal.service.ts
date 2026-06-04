import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum StockJournalType {
  Manufacturing = 'Manufacturing',
  GodownTransfer = 'GodownTransfer',
  MaterialIssue = 'MaterialIssue',
  MaterialReceipt = 'MaterialReceipt',
  ScrapAdjustment = 'ScrapAdjustment'
}

export interface StockJournalDto {
  id: number;
  voucherNumber: string;
  voucherDate: Date;
  journalType: StockJournalType;
  reference?: string;
  narration?: string;
  sourceGodownId?: number;
  sourceGodownName?: string;
  destinationGodownId?: number;
  destinationGodownName?: string;
  manufacturingProcess?: string;
  sourceItems: StockJournalItemDto[];
  destinationItems: StockJournalItemDto[];
  createdDate: Date;
  createdBy: string;
}

export interface StockJournalItemDto {
  productId: number;
  productName: string;
  quantity: number;
  rate: number;
  amount: number;
  godownId: number;
  godownName: string;
}

export interface CreateStockJournalDto {
  voucherDate: Date;
  journalType: StockJournalType;
  reference?: string;
  narration?: string;
  sourceGodownId?: number;
  destinationGodownId?: number;
  manufacturingProcess?: string;
  sourceItems: {
    productId: number;
    quantity: number;
    rate: number;
    godownId: number;
  }[];
  destinationItems: {
    productId: number;
    quantity: number;
    rate: number;
    godownId?: number;
  }[];
}

export interface GodownDto {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  sku: string;
  standardCost?: number;
  salesPrice?: number;
  unitOfMeasure: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockJournalService {
  private apiUrl = `${environment.apiUrl}/api/stockjournal`;

  constructor(private http: HttpClient) {}

  getAll(
    type?: string,
    startDate?: Date | null,
    endDate?: Date | null,
    godownId?: number
  ): Observable<StockJournalDto[]> {
    let url = `${this.apiUrl}`;
    const params: any = {};

    if (type) params.type = type;
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];
    if (godownId) params.godownId = godownId;

    return this.http.get<StockJournalDto[]>(url, { params });
  }

  getById(id: number): Observable<StockJournalDto> {
    return this.http.get<StockJournalDto>(`${this.apiUrl}/${id}`);
  }

  create(journal: CreateStockJournalDto): Observable<{ id: number; voucherNumber: string }> {
    return this.http.post<{ id: number; voucherNumber: string }>(this.apiUrl, journal);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGodowns(): Observable<GodownDto[]> {
    return this.http.get<GodownDto[]>(`${environment.apiUrl}/api/godowns`);
  }

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${environment.apiUrl}/api/products`);
  }

  generateVoucherNumber(type: StockJournalType): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/generate-number/${type}`, { responseType: 'text' as 'json' });
  }
}
