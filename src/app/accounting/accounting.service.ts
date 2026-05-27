import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AccountHead, CreateAccountHead, LedgerEntry, TrialBalance, FinancialStatement } from './accounting.models';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private apiUrl = `${environment.apiUrl}/accounting`;
  
  chartOfAccounts = signal<AccountHead[]>([]);

  constructor(private http: HttpClient) {}

  getChartOfAccounts() {
    return this.http.get<AccountHead[]>(`${this.apiUrl}/chart-of-accounts`);
  }

  createAccount(account: CreateAccountHead) {
    return this.http.post<AccountHead>(`${this.apiUrl}/accounts`, account);
  }

  postTransaction(entry: LedgerEntry) {
    return this.http.post<LedgerEntry>(`${this.apiUrl}/ledger`, entry);
  }

  getTrialBalance(fromDate: Date, toDate: Date) {
    const params = { 
      fromDate: fromDate.toISOString().split('T')[0], 
      toDate: toDate.toISOString().split('T')[0] 
    };
    return this.http.get<TrialBalance[]>(`${this.apiUrl}/trial-balance`, { params });
  }

  getProfitLoss(fromDate: Date, toDate: Date) {
    const params = { 
      fromDate: fromDate.toISOString().split('T')[0], 
      toDate: toDate.toISOString().split('T')[0] 
    };
    return this.http.get<FinancialStatement[]>(`${this.apiUrl}/profit-loss`, { params });
  }

  getBalanceSheet(asOfDate: Date) {
    const params = { asOfDate: asOfDate.toISOString().split('T')[0] };
    return this.http.get<FinancialStatement[]>(`${this.apiUrl}/balance-sheet`, { params });
  }
}
