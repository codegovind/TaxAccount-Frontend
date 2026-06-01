import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface CashFlowResponse {
  year: string;
  currency: string;
  monthlyData: MonthlyCashFlow[];
}

interface MonthlyCashFlow {
  month: string;
  openingBalance: number;
  cashInflows: number;
  cashOutflows: number;
  closingBalance: number;
  netChange: number;
}

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {
  private readonly apiUrl = `${environment.apiUrl}/api/cashflow`;

  constructor(private http: HttpClient) {}

  /**
   * Get cash flow report for a specific year
   * @param year - Financial year (e.g., '2024')
   */
  getCashFlow(year: string): Observable<CashFlowResponse> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year);
    }
    return this.http.get<CashFlowResponse>(`${this.apiUrl}`, { params });
  }

  /**
   * Get cash flow for a specific date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  getCashFlowByDateRange(startDate: string, endDate: string): Observable<CashFlowResponse> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<CashFlowResponse>(`${this.apiUrl}/range`, { params });
  }
}
