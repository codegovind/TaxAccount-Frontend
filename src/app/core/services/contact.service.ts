import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ContactDto,
  CreateContactDto
} from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) {}

  getAll(type?: string): Observable<ContactDto[]> {
    const params = type ? `?type=${type}` : '';
    return this.http.get<ContactDto[]>(`${this.apiUrl}${params}`);
  }

  getVendors(): Observable<ContactDto[]> {
    return this.http.get<ContactDto[]>(`${this.apiUrl}/vendors`);
  }

  getCustomers(): Observable<ContactDto[]> {
    return this.http.get<ContactDto[]>(`${this.apiUrl}/customers`);
  }

  getContacts(): Observable<ContactDto[]>{
    return this.http.get<ContactDto[]>(`${this.apiUrl}/both`);
  }

  getById(id: number): Observable<ContactDto> {
    return this.http.get<ContactDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateContactDto): Observable<ContactDto> {
    return this.http.post<ContactDto>(this.apiUrl, dto);
  }

  update(id: number, dto: CreateContactDto): Observable<ContactDto> {
    return this.http.put<ContactDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}