import type { PaymentOption } from "../types/payment.types";

export const paymentsApi = {
  methods: async (): Promise<PaymentOption[]> => {
    return [
      {
        value: "CREDIT_CARD",
        label: "Credit Card",
        description: "Pay securely using your card.",
      },
      {
        value: "PAYPAL",
        label: "PayPal",
        description: "Use your PayPal account for instant checkout.",
      },
      {
        value: "COD",
        label: "Cash on Delivery",
        description: "Pay when your order arrives.",
      },
    ];
  },
};
