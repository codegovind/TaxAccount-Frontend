import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  totalInvoices: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  pendingInvoices: number;
  draftInvoices: number;
  recentInvoices: RecentInvoice[];
}

export interface RecentInvoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  invoiceDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiUrl}/home`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }
}