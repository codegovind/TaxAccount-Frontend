export interface CreateInvoiceItemDto {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

export interface CreateInvoiceDto {
  customerId: number;
  dueDate: Date;
  notes: string;
  items: CreateInvoiceItemDto[];
}

export interface InvoiceItemResponse {
  id: number;
  productId: number;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
}

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: string;
  customerId: number;
  customerName: string;
  createdByName: string;
  notes: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  items: InvoiceItemResponse[];
}