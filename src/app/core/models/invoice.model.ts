// Enums for the new invoice properties
export enum PaymentMethod {
  Cash = 1,
  UPI = 2,
  BankTransfer = 3,
  Credit = 4
}

export enum InvoiceType {
  Sale = 1,
  Purchase = 2
}

export enum EntrySource {
  FullAccounting = 1,
  ComplianceOnly = 2 // E-Way Bill addon
}

export enum InvoiceStatus {
  Draft = 1,
  Sent = 2,
  Paid = 3,
  Cancelled = 4
}

// ─── 1. CREATION DTOs (Data sent TO the API) ───

export interface CreateInvoiceItemDto {
  productId: number;
  description: string;
  quantity: number;
  // Backend will usually fetch the unitPrice and GST from the Product table,
  // but we send these in case the user overrides them on the form.
  unitPrice: number;
  discountPercent: number; 
  taxPercent: number;
}

export interface CreateInvoiceDto {
  invoiceType: InvoiceType;
  paymentMethod: PaymentMethod;
  entrySource: EntrySource;
  
  // Notice this is now contactId, and it is optional (?) for Cash Sales!
  contactId?: number | null; 
  
  invoiceDate: string | Date;
  dueDate: string | Date;
  notes: string;
  items: CreateInvoiceItemDto[];
}

// ─── 2. RESPONSE DTOs (Data received FROM the API) ───

export interface InvoiceItemResponse {
  id: number;
  productId: number;
  productName: string;
  description: string;
  hsnCode: string; // NEW: Crucial for E-Way Bills
  unit: string;
  quantity: number;
  unitPrice: number;
  
  discountPercent: number;
  discountAmount: number;

  // NEW: Granular GST Breakdown
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

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  paymentMethod: PaymentMethod;
  entrySource: EntrySource;
  invoiceDate: string | Date;
  dueDate: string | Date;
  status: InvoiceStatus; // Using the enum now instead of a raw string
  
  // NEW: Updated to Contact logic
  contactId?: number | null;
  contactName?: string | null; // Will be null for Cash Sales
  
  createdByName: string;
  notes: string;
  
  // Financial Totals
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string | Date;
  
  items: InvoiceItemResponse[];
}