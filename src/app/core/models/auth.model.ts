export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
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
  permissions: string[];
  expiresAt: Date;
}