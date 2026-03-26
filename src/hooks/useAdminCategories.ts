import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoriesApi } from "../api/categories.api";
import type { CategoryPayload } from "../types/category.types";

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: categoriesApi.list,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoriesApi.create(payload),
    onSuccess: async () => {
      toast.success("Category created");
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Could not create category"),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      categoriesApi.update(id, payload),
    onSuccess: async () => {
      toast.success("Category updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Could not update category"),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: async () => {
      toast.success("Category deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Could not delete category"),
  });
};
