import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EWayBillRequest, EWayBillResponse, TenantSettings, UpdateTenantSettings } from './compliance.models';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {
  private apiUrl = `${environment.apiUrl}/compliance`;
  
  settings = signal<TenantSettings | null>(null);

  constructor(private http: HttpClient) {}

  generateEWayBill(request: EWayBillRequest) {
    return this.http.post<EWayBillResponse>(`${this.apiUrl}/ewaybill/generate`, request);
  }

  getEWayBillByInvoice(invoiceId: number) {
    return this.http.get<EWayBillResponse>(`${this.apiUrl}/ewaybill/invoice/${invoiceId}`);
  }

  getSettings() {
    return this.http.get<TenantSettings>(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: UpdateTenantSettings) {
    return this.http.put<TenantSettings>(`${this.apiUrl}/settings`, settings);
  }
}
