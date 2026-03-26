import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { ordersApi } from "../api/orders.api";
import type { CreateOrderInput } from "../types/order.types";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
  });
};

export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.byId(id),
    enabled: Boolean(id),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderInput) => ordersApi.create(payload),
    onSuccess: async () => {
      toast.success("Order placed successfully");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? (error.response?.data?.message ?? "Could not place order.")
        : "Could not place order.";
      toast.error(message);
    },
  });
};
