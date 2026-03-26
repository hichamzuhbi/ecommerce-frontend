import type { PaymentMethod } from "./order.types";

export interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
}
