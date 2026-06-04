import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RecurringVoucher {
  id: string;
  name: string;
  description?: string;
  voucherType: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  isActive: boolean;
  entries: RecurringVoucherEntry[];
  createdDate?: string;
  lastExecutionDate?: string;
  nextExecutionDate?: string;
}

export interface RecurringVoucherEntry {
  accountHeadId: string;
  accountHeadName?: string;
  debit: number;
  credit: number;
}

export interface RecurringVoucherLog {
  id: string;
  recurringVoucherId: string;
  executionDate: string;
  status: 'Success' | 'Failed';
  voucherNumber?: string;
  errorMessage?: string;
  createdDate: string;
}

export interface ExecuteResponse {
  voucherNumber: string;
  voucherId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecurringVoucherService {
  private apiUrl = `${environment.apiUrl}/api/recurring-voucher`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RecurringVoucher[]> {
    return this.http.get<RecurringVoucher[]>(this.apiUrl);
  }

  getById(id: string): Observable<RecurringVoucher> {
    return this.http.get<RecurringVoucher>(`${this.apiUrl}/${id}`);
  }

  create(voucher: Partial<RecurringVoucher>): Observable<RecurringVoucher> {
    return this.http.post<RecurringVoucher>(this.apiUrl, voucher);
  }

  update(id: string, voucher: Partial<RecurringVoucher>): Observable<RecurringVoucher> {
    return this.http.put<RecurringVoucher>(`${this.apiUrl}/${id}`, voucher);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  executeNow(id: string): Observable<ExecuteResponse> {
    return this.http.post<ExecuteResponse>(`${this.apiUrl}/${id}/execute`, {});
  }

  getLogs(id: string): Observable<RecurringVoucherLog[]> {
    return this.http.get<RecurringVoucherLog[]>(`${this.apiUrl}/${id}/logs`);
  }
}
