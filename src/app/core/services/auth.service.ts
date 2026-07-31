import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto, DecodedToken } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // We use DecodedToken here so the UI can easily read CompanyName and TenantId
  private currentUserSubject = new BehaviorSubject<DecodedToken | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Automatically load user if they refresh the page
    this.loadTokenFromStorage();
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => this.handleAuthentication(response.token))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => this.handleAuthentication(response.token))
    );
  }

  logout(): void {
    localStorage.removeItem('taxaccount_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('taxaccount_token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false; // No token at all

    const decoded: any = this.decodeToken(token);
    if (!decoded) return false;

    if (decoded.exp) {
      const isExpired = (decoded.exp * 1000) < Date.now();
      if (isExpired) {
        console.warn('Token is expired! Cleaning up storage...');
        this.logout();
        return false;
      }
    }

    return true; // Token exists and is not expired
  }

  // --- NEW: Token Handling Logic (robust decode + helpers) ---

  private handleAuthentication(token: string) {
    localStorage.setItem('taxaccount_token', token);
    const decoded = this.decodeToken(token);
    this.currentUserSubject.next(decoded);
  }

  private loadTokenFromStorage() {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      this.currentUserSubject.next(decoded);
    }
  }

  /**
   * Robust JWT payload decoder that supports URL-safe Base64 and missing padding.
   * Returns a DecodedToken or null on failure.
   */
  private decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let payload = parts[1];

      // Replace URL-safe characters
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with '=' to make length a multiple of 4
      while (payload.length % 4 !== 0) {
        payload += '=';
      }

      const decodedJson = atob(payload);
      const obj = JSON.parse(decodedJson);

      // Normalize common claim names to a consistent interface
      const normalized: any = {
        userId: obj.userId ?? obj.user_id ?? obj.sub ?? null,
        tenantId: obj.tenantId ?? obj.tenant_id ?? obj.TenantId ?? obj.tenant ?? null,
        companyName: obj.companyName ?? obj.company_name ?? obj.cn ?? null,
        roles: obj.roles ?? obj.role ?? [],
        exp: obj.exp ?? null
      };

      return normalized as DecodedToken;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  getCurrentUser(): DecodedToken | null {
    return this.currentUserSubject.value;
  }

  getTenantId(): number | null {
    const u = this.getCurrentUser();
    if (!u) return null;
    // Ensure number or null
    const t = u.tenantId;
    if (t === null || t === undefined) return null;
    return typeof t === 'number' ? t : parseInt(String(t), 10) || null;
  }

  hasPermission(permission: string): boolean {
    return this.isLoggedIn();
  }
}
