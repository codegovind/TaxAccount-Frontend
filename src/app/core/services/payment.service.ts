import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Payment {
  id?: number;
  paymentNumber?: string;
  date: string;
  amount: number;
  type: 'Receipt' | 'Payment';
  status: 'Completed' | 'Pending' | 'Cancelled';
  referenceType: 'Invoice' | 'PurchaseBill' | 'Expense';
  referenceId?: number;
  contactId?: number;
  description?: string;
  paymentMethod: 'Cash' | 'Bank' | 'UPI' | 'Cheque';
  bankName?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = '/api/payments';

  constructor(private http: HttpClient) {}

  getPayments(params?: any): Observable<Payment[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return this.http.get<Payment[]>(this.apiUrl, { params: httpParams });
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
