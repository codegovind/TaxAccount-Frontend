export interface CreatePurchaseItemDto {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface CreatePurchaseBillDto {
  contactId?: number;
  billDate: string;
  dueDate?: string;
  vendorBillNumber: string;
  paymentMethod: number;
  notes: string;
  items: CreatePurchaseItemDto[];
}

export interface CreatePurchaseOrderDto {
  contactId?: number;
  orderDate: string;
  expectedDate?: string;
  notes: string;
  items: CreatePurchaseItemDto[];
}

export interface PurchaseItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
  totalAmount: number;
}

export interface PurchaseBillResponseDto {
  id: number;
  billNumber: string;
  vendorBillNumber: string;
  billDate: Date;
  dueDate?: Date;
  status: string;
  paymentMethod: string;
  contactId?: number;
  vendorName: string;
  createdByName: string;
  notes: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  items: PurchaseItemResponseDto[];
}

export interface PurchaseOrderResponseDto {
  id: number;
  orderNumber: string;
  orderDate: Date;
  expectedDate?: Date;
  status: string;
  contactId?: number;
  vendorName: string;
  createdByName: string;
  notes: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  items: PurchaseItemResponseDto[];
}