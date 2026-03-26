import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import type { QueryParams } from "../types/api.types";

export const useProducts = (params: QueryParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.byId(id),
    enabled: Boolean(id),
  });
};

export const useRelatedProducts = (categoryId: string) => {
  return useQuery({
    queryKey: ["related-products", categoryId],
    queryFn: () => productsApi.related(categoryId),
    enabled: Boolean(categoryId),
  });
};
