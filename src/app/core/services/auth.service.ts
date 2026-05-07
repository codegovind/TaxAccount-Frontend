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
    //return !!this.getToken();
    const token = this.getToken();
    if (!token) return false; // No token at all

    // Use your existing decode method to read the JWT payload
    const decoded: any = this.decodeToken(token); 
    
    // JWTs contain an 'exp' (expiration) claim in seconds
    if (decoded && decoded.exp) {
      // Convert seconds to milliseconds to compare with JavaScript's Date.now()
      const isExpired = (decoded.exp * 1000) < Date.now();
      
      if (isExpired) {
        console.warn('Token is expired! Cleaning up storage...');
        this.logout(); // Automatically delete the dead token
        return false;  // Tell the guard they are NOT logged in
      }
    }

    return true; // Token exists and is not expired
  }

  // --- NEW: Token Handling Logic ---

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

  private decodeToken(token: string): DecodedToken | null {
    try {
      // JWTs have 3 parts separated by dots. The middle part is the data payload.
      const payload = token.split('.')[1];
      const decodedJson = atob(payload); // Decodes base64 string
      return JSON.parse(decodedJson) as DecodedToken;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  getCurrentUser(): DecodedToken | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: string): boolean {
    // For now, if they are logged in, we let them proceed. 
    // You can strictly tie this to roles/permissions inside the DecodedToken later!
    return this.isLoggedIn();
  }
}