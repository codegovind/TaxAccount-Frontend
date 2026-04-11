import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateInvoiceDto, InvoiceResponse } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoice`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InvoiceResponse[]> {
    return this.http.get<InvoiceResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateInvoiceDto): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(this.apiUrl, dto);
  }

  updateStatus(id: number, status: number): Observable<InvoiceResponse> {
    return this.http.patch<InvoiceResponse>(
      `${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}