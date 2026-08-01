import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccountHead {
  id: number;
  name: string;
  code: string;
  type: number; // 0=Asset, 1=Liability, 2=Equity, 3=Income, 4=Expense
  parentId?: number;
  openingBalance: number;
  tenantId: number;
  isActive: boolean;
}

export interface LedgerEntry {
  id: number;
  accountHeadId: number;
  accountHead?: AccountHead;
  date: Date;
  voucherType: string;
  voucherId?: number;
  voucherNumber: string;
  narration: string;
  debit: number;
  credit: number;
  tenantId: number;
  createdByUserId: number;
  createdAt: Date;
}

export interface TrialBalanceItem {
  accountHeadId: number;
  accountCode: string;
  accountName: string;
  accountType: number;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalance {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
}

export interface FinancialStatementItem {
  accountHeadId: number;
  accountCode: string;
  accountName: string;
  amount: number;
  isHeader: boolean;
  parentId?: number;
  type: string; // Asset, Liability, Equity, Income, Expense
  name: string; // For grouping display
}

export interface FinancialStatement {
  items: FinancialStatementItem[];
  total: number;
  fromDate: Date;
  toDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private apiUrl = '/api/accounting';

  constructor(private http: HttpClient) { }

  getChartOfAccounts(): Observable<AccountHead[]> {
    return this.http.get<AccountHead[]>(`${this.apiUrl}/chart-of-accounts`);
  }

  createAccount(account: AccountHead): Observable<AccountHead> {
    return this.http.post<AccountHead>(`${this.apiUrl}/chart-of-accounts`, account);
  }

  createVoucher(voucher: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vouchers`, voucher);
  }

  getGeneralLedger(accountHeadId?: number, fromDate?: Date, toDate?: Date): Observable<LedgerEntry[]> {
    let params = new HttpParams();
    if (accountHeadId) params = params.set('accountHeadId', accountHeadId.toString());
    if (fromDate) params = params.set('fromDate', fromDate.toISOString());
    if (toDate) params = params.set('toDate', toDate.toISOString());
    return this.http.get<LedgerEntry[]>(`${this.apiUrl}/general-ledger`, { params });
  }

  getTrialBalance(fromDate: Date, toDate: Date): Observable<TrialBalance> {
    let params = new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString());
    return this.http.get<TrialBalance>(`${this.apiUrl}/trial-balance`, { params });
  }

  getBalanceSheet(asOfDate: Date): Observable<FinancialStatement> {
    let params = new HttpParams().set('asOfDate', asOfDate.toISOString());
    return this.http.get<FinancialStatement>(`${this.apiUrl}/balance-sheet`, { params });
  }

  getProfitLoss(fromDate: Date, toDate: Date): Observable<FinancialStatement> {
    let params = new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString());
    return this.http.get<FinancialStatement>(`${this.apiUrl}/profit-loss`, { params });
  }
}
