export interface AccountHead {
  id: number;
  name: string;
  code: string;
  type: string; // Asset, Liability, Equity, Income, Expense
  parentId?: number;
  parentName?: string;
  openingBalance: number;
  isActive: boolean;
  children: AccountHead[];
}

export interface CreateAccountHead {
  name: string;
  code: string;
  type: string;
  parentId?: number;
  openingBalance: number;
}

export interface LedgerEntry {
  id: number;
  accountHeadId: number;
  accountHeadName: string;
  date: Date;
  voucherType: string;
  voucherId?: number;
  voucherNumber: string;
  narration: string;
  debit: number;
  credit: number;
  createdAt: Date;
}

export interface TrialBalance {
  accountCode: string;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  currentDebit: number;
  currentCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface FinancialStatement {
  accountName: string;
  amount: number;
  level: number;
  children: FinancialStatement[];
}

export interface CashFlowStatement {
  method: 'direct' | 'indirect';
  period: string;
  fromDate: Date;
  toDate: Date;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  openingBalance: number;
  closingBalance: number;
  netChange: number;
}

export interface CashFlowSection {
  title: string;
  items: CashFlowLineItem[];
  netAmount: number;
}

export interface CashFlowLineItem {
  description: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'total';
}
