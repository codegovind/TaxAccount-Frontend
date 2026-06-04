export interface RecurringVoucher {
  id: string;
  name: string;
  description?: string;
  voucherType: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  isActive: boolean;
  entries: RecurringVoucherEntry[];
  createdDate?: string;
  lastExecutionDate?: string;
}

export interface RecurringVoucherEntry {
  accountHeadId: string;
  accountHeadName?: string;
  debit: number;
  credit: number;
}

export interface RecurringVoucherLog {
  id: string;
  recurringVoucherId: string;
  executionDate: string;
  status: 'Success' | 'Failed';
  voucherNumber?: string;
  errorMessage?: string;
  createdDate: string;
}
