// Paystack payment integration for Nigeria
// Documentation: https://paystack.com/docs/api

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: Record<string, any>;
    paid_at: string;
  };
}

async function paystackRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const response = await fetch(`https://api.paystack.co${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Paystack API error');
  }

  return data as T;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // Amount in kobo (NGN smallest unit)
  reference?: string;
  callback_url: string;
  metadata?: Record<string, any>;
}): Promise<PaystackInitializeResponse> {
  return paystackRequest<PaystackInitializeResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  return paystackRequest<PaystackVerifyResponse>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function generateReference(): string {
  return `DK_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function isPaystackConfigured(): boolean {
  return !!PAYSTACK_SECRET_KEY;
}
