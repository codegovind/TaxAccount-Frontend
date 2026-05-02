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

export interface Contact {
  id?: number;
  tenantId: number;
  name: string;
  gstin?: string;
  gstType: GstType;
  contactType: ContactType;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;      
  pinCode?: string;
  openingBalance: number;
  isDefault: boolean;
}