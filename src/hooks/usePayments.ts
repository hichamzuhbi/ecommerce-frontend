import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "../api/payments.api";

export const usePayments = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: paymentsApi.methods,
    staleTime: Infinity,
  });
};
