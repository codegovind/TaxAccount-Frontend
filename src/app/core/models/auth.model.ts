export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  companyName: string; // NEW: Required for Tenant creation
  companyEmail: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  companyName?: string; // NEW: To display in the UI
  tenantId: number;
  permissions: string[];
  expiresAt: Date;
}

// NEW: This matches the Claims set in your C# backend
export interface DecodedToken {
  nameid: string; 
  email: string;
  role: string;
  TenantId: string;    
  CompanyName: string; 
  exp: number;
}