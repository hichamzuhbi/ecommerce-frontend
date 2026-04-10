import { axiosInstance } from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import type {
  InitiatePaymentInput,
  InitiatePaymentResponse,
  PaymentOption,
  PaymentStatusResponse,
} from "../types/payment.types";
import type { PaymentMethod } from "../types/order.types";

const normalizePaymentMethod = (value: string): PaymentMethod | null => {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  if (normalized === "CREDIT_CARD") return "CREDIT_CARD";
  if (normalized === "PAYPAL") return "PAYPAL";
  if (normalized === "COD") return "COD";
  return null;
};

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
  initiate: async (
    payload: InitiatePaymentInput,
  ): Promise<InitiatePaymentResponse> => {
    const normalizedMethod = normalizePaymentMethod(payload.method);
    if (!normalizedMethod) {
      throw new Error("Invalid payment method");
    }
    const { data } = await axiosInstance.post<
      ApiResponse<InitiatePaymentResponse>
    >("/payments", {
      ...payload,
      method: normalizedMethod,
    });
    return data.data;
  },
  status: async (orderId: string): Promise<PaymentStatusResponse> => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaymentStatusResponse>
    >(`/payments/${orderId}`);
    return data.data;
  },
};
