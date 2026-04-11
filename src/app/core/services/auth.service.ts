import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
//import { environment } from '../../../environments/environment';
import { environment } from '../../../environments/environment.development';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on startup
    const stored = localStorage.getItem('taxaccount_user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => {
        localStorage.setItem('taxaccount_user', JSON.stringify(response));
        localStorage.setItem('taxaccount_token', response.token);
        this.currentUserSubject.next(response);
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => {
        localStorage.setItem('taxaccount_user', JSON.stringify(response));
        localStorage.setItem('taxaccount_token', response.token);
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('taxaccount_user');
    localStorage.removeItem('taxaccount_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('taxaccount_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions?.includes(permission) ?? false;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }
}