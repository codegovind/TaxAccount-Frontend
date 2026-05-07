export enum GstType {
  Registered = 1,
  Unregistered = 2,
  Composition = 3,
  Consumer = 4
}

export enum ContactType {
  Customer = 1,
  Vendor = 2,
  Both = 3
}

export interface CreateContactDto {
  name: string;
  gstin?: string;        // ← correct field name (not gstNumber)
  gstType: number;       // ← must be number not string
  contactType: number;   // ← must be number not string
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  openingBalance: number;
  // NO email field — API doesn't have it
}

export interface UpdateContactDto {
  name: string;
  gstin?: string;
  gstType: number;
  contactType: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  openingBalance: number;
  isActive: boolean;
}

export interface ContactDto {
  id: number;
  tenantId: number;
  name: string;
  gstin?: string;
  gstType: string;
  contactType: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  openingBalance: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}