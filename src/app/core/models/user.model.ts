export interface User {
  id: number;
  tenantId: number; // NEW: Multi-tenant isolation!
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}