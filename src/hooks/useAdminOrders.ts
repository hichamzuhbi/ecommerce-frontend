import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ordersApi } from "../api/orders.api";
import type { AdminOrderFilters, OrderStatus } from "../types/order.types";

export const useAdminOrders = (filters: AdminOrderFilters) => {
  return useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => ordersApi.adminAll(filters),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: async () => {
      toast.success("Order status updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Could not update order status"),
  });
};
