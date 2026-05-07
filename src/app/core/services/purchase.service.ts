import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePurchaseBillDto,
  CreatePurchaseOrderDto,
  PurchaseBillResponseDto,
  PurchaseOrderResponseDto
} from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/purchase`;

  constructor(private http: HttpClient) {}

  // Bills
  getAllBills(): Observable<PurchaseBillResponseDto[]> {
    return this.http.get<PurchaseBillResponseDto[]>(
      `${this.apiUrl}/bills`);
  }

  getBillById(id: number): Observable<PurchaseBillResponseDto> {
    return this.http.get<PurchaseBillResponseDto>(
      `${this.apiUrl}/bills/${id}`);
  }

  createBill(dto: CreatePurchaseBillDto):
    Observable<PurchaseBillResponseDto> {
    return this.http.post<PurchaseBillResponseDto>(
      `${this.apiUrl}/bills`, dto);
  }

  deleteBill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bills/${id}`);
  }

  // Orders
  getAllOrders(): Observable<PurchaseOrderResponseDto[]> {
    return this.http.get<PurchaseOrderResponseDto[]>(
      `${this.apiUrl}/orders`);
  }

  getOrderById(id: number): Observable<PurchaseOrderResponseDto> {
    return this.http.get<PurchaseOrderResponseDto>(
      `${this.apiUrl}/orders/${id}`);
  }

  createOrder(dto: CreatePurchaseOrderDto):
    Observable<PurchaseOrderResponseDto> {
    return this.http.post<PurchaseOrderResponseDto>(
      `${this.apiUrl}/orders`, dto);
  }

  updateOrderStatus(id: number, status: number):
    Observable<PurchaseOrderResponseDto> {
    return this.http.patch<PurchaseOrderResponseDto>(
      `${this.apiUrl}/orders/${id}/status`, { status });
  }

  convertOrderToBill(orderId: number):
    Observable<PurchaseBillResponseDto> {
    return this.http.post<PurchaseBillResponseDto>(
      `${this.apiUrl}/orders/${orderId}/convert-to-bill`, {});
  }
}