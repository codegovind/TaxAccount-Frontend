export interface Product {
  id?: number;
  tenantId: number;
  name: string;
  sku: string;
  hsnCode: string;
  description: string;
  price: number;       
  purchasePrice: number; // NEW: For AS-2 Valuation (Cost)
  marketValue?: number;  // NEW: For AS-2 Valuation (NRV)
  stock: number;
  unit: string;
  gstPercent: number;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  hsnCode: string;
  description: string;
  purchasePrice: number;
  marketValue: number;
  price: number;
  stock: number;
  unit: string;
  gstPercent: number;
}
