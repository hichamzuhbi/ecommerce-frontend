import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentsApi } from "../api/payments.api";
import type { InitiatePaymentInput } from "../types/payment.types";

export const usePayments = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: paymentsApi.methods,
    staleTime: Infinity,
  });
};

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitiatePaymentInput) =>
      paymentsApi.initiate(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Could not initiate payment"),
  });
};
