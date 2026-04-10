import type { PaymentMethod } from "./order.types";
import type { Order } from "./order.types";

export interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
}

export interface InitiatePaymentInput {
  orderId: string;
  method: PaymentMethod;
  transactionId?: string;
}

export interface InitiatePaymentResponse {
  paymentId?: string;
  status?: string;
  paymentUrl?: string;
  clientSecret?: string;
}

export interface PaymentStatusResponse {
  paymentStatus?: Order["paymentStatus"];
  status?: string;
  method?: PaymentMethod;
}
