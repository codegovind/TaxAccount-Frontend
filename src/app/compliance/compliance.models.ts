export interface EWayBillRequest {
  invoiceId: number;
  transporterId: string;
  vehicleNumber: string;
  dispatchDate: Date;
  shippingAddress?: string;
  shippingPinCode?: string;
  shippingState?: string;
}

export interface EWayBillResponse {
  id: number;
  ewayBillNumber: string;
  generatedDate: Date;
  validUntil: Date;
  irn: string;
  isActive: boolean;
}

export interface TenantSettings {
  id: number;
  companyName: string;
  gstn: string;
  stateCode: string;
  address: string;
  phone: string;
  email: string;
  isEWayBillEnabled: boolean;
  isInventoryEnabled: boolean;
  isGstEnabled: boolean;
  ewayBillUsername?: string;
  ewayBillPassword?: string;
}

export interface UpdateTenantSettings {
  companyName: string;
  gstn: string;
  stateCode: string;
  address: string;
  phone: string;
  email: string;
  isEWayBillEnabled: boolean;
  isInventoryEnabled: boolean;
  isGstEnabled: boolean;
  ewayBillUsername?: string;
  ewayBillPassword?: string;
}
