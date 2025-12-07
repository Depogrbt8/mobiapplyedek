import { apiClient } from '@/core/api/client';

interface ProcessPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  paymentToken?: string;
}

interface PaymentResponse {
  success: boolean;
  requires3DSecure?: boolean;
  redirectUrl?: string;
  transactionId?: string;
  message?: string;
  error?: string;
}

/**
 * Payment service
 */
export const paymentService = {
  /**
   * Process payment
   * Note: Card details should be tokenized on client side before sending
   */
  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>('/api/payment/process', {
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      paymentToken: data.paymentToken,
    });

    return response.data;
  },

  /**
   * Tokenize card (if using payment gateway SDK)
   * This should be implemented with actual payment gateway SDK
   */
  async tokenizeCard(cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string): Promise<string> {
    // TODO: Implement with actual payment gateway SDK (e.g., Stripe, Adyen)
    // For now, return a placeholder
    const response = await apiClient.post<{ token: string }>('/api/payment/tokenize', {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
    });
    return response.data.token;
  },
};

