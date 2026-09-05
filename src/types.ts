export interface LoanOption {
  amount: number;
  label: string;
  fee: number;
  feeText: string;
}

export interface LiveActivity {
  initial: string;
  name: string;
  phone: string;
  amount: string;
  time: string;
}

export interface ApplicationFormData {
  fullName: string;
  phone: string;
  county: string;
  loanReason: string;
  email: string;
}

export interface LoanApplication {
  id: string;
  paymentId: string;
  amount: number;
  serviceFee: number;
  formData: ApplicationFormData;
  reference: string;
  status: 'PENDING' | 'SENDING' | 'STK_SENT' | 'PROCESSING' | 'APPROVED' | 'FAILED';
  createdAt: string;
}

export type AppView = 
  | { type: 'landing' }
  | { type: 'apply'; amount: number }
  | { type: 'review'; id: string }
  | { type: 'confirm'; id: string }
  | { type: 'payment'; id: string; ref: string }
  | { type: 'result'; id: string; status: 'APPROVED' | 'FAILED' };
