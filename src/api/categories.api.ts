import { axiosInstance } from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import type { Category } from "../types/category.types";
import type { CategoryPayload } from "../types/category.types";

type RawCategory = Partial<Category> & {
  image?: string;
  imageURL?: string;
  productsCount?: number | string;
  product_count?: number | string;
  products?: unknown[];
  _count?: {
    products?: number;
  };
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeCategory = (category: RawCategory): Category => {
  const productCountCandidates = [
    toNumber(category.productCount),
    toNumber(category.productsCount),
    toNumber(category.product_count),
    toNumber(category._count?.products),
    Array.isArray(category.products) ? category.products.length : null,
  ];

  const resolvedProductCount =
    productCountCandidates.find((count) => count !== null) ?? 0;

  return {
    id: category.id ?? "",
    name: category.name ?? "",
    slug: category.slug ?? "",
    description: category.description,
    imageUrl: category.imageUrl ?? category.image ?? category.imageURL,
    parentCategoryId: category.parentCategoryId,
    productCount: resolvedProductCount,
  };
};

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } =
      await axiosInstance.get<ApiResponse<RawCategory[]>>("/categories");
    return (data.data ?? []).map(normalizeCategory);
  },

  create: async (payload: CategoryPayload): Promise<Category> => {
    const { data } = await axiosInstance.post<ApiResponse<RawCategory>>(
      "/categories",
      payload,
    );
    return normalizeCategory(data.data);
  },

  update: async (id: string, payload: CategoryPayload): Promise<Category> => {
    const { data } = await axiosInstance.patch<ApiResponse<RawCategory>>(
      `/categories/${id}`,
      payload,
    );
    return normalizeCategory(data.data);
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};
