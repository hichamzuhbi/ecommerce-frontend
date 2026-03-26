import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { productsApi } from "../api/products.api";
import type { ProductPayload } from "../types/product.types";

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    const apiMessage = error.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }
  }

  return fallback;
};

interface AdminProductsParams {
  page: number;
  limit: number;
  search?: string;
}

export const useAdminProducts = (params: AdminProductsParams) => {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => productsApi.adminList(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminProduct = (id: string) => {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => productsApi.byId(id),
    enabled: Boolean(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      uploads,
    }: {
      payload: ProductPayload;
      uploads?: FormData | null;
    }) => productsApi.create(payload, uploads ?? null),
    onSuccess: async () => {
      toast.success("Product created successfully");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) =>
      toast.error(resolveErrorMessage(error, "Could not create product")),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      uploads,
    }: {
      id: string;
      payload: ProductPayload;
      uploads?: FormData | null;
    }) => productsApi.update(id, payload, uploads ?? null),
    onSuccess: async (_, variables) => {
      toast.success("Product updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-product", variables.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });
    },
    onError: (error) =>
      toast.error(resolveErrorMessage(error, "Could not update product")),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: async () => {
      toast.success("Product deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Could not delete product"),
  });
};
