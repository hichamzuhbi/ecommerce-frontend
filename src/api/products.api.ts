import { axiosInstance } from "./axios.instance";
import type {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "../types/api.types";
import type { Product } from "../types/product.types";
import type { ProductPayload } from "../types/product.types";
import { resolveImageUrl } from "../utils/image.utils";

interface AdminProductQuery {
  page?: number;
  limit?: number;
  search?: string;
}

type RawProduct = Partial<Product> & {
  title?: string;
  image?: string;
  imageURL?: string;
  images?: string[];
  category?:
    | string
    | {
        id?: string;
        name?: string;
        title?: string;
        slug?: string;
      };
  category_id?: string;
  categoryID?: string;
  category_name?: string;
  categoryTitle?: string;
};

const toPublicProductImageUrl = (value: string | undefined): string => {
  return resolveImageUrl(value);
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const resolveCategoryName = (product: RawProduct): string => {
  const nestedCategoryName =
    typeof product.category === "object" && product.category
      ? (product.category.name ?? product.category.title)
      : undefined;

  const directCategoryName =
    product.categoryName ?? product.category_name ?? product.categoryTitle;

  const fallbackCategoryName =
    typeof product.category === "string" ? product.category : undefined;

  return (
    nestedCategoryName?.trim() ||
    directCategoryName?.trim() ||
    fallbackCategoryName?.trim() ||
    "Uncategorized"
  );
};

const resolveCategoryId = (product: RawProduct): string => {
  const nestedCategoryId =
    typeof product.category === "object" && product.category
      ? product.category.id
      : undefined;

  return (
    product.categoryId?.trim() ||
    product.category_id?.trim() ||
    product.categoryID?.trim() ||
    nestedCategoryId?.trim() ||
    ""
  );
};

const normalizeProduct = (product: RawProduct): Product => {
  const rawImageUrls =
    product.imageUrls && product.imageUrls.length
      ? product.imageUrls
      : (product.images ?? []);

  const firstGalleryImage = rawImageUrls.find((url) => {
    if (typeof url !== "string" || !url.trim()) {
      return false;
    }

    return true;
  });
  const primaryImage = toPublicProductImageUrl(
    firstGalleryImage ||
      (typeof product.imageUrl === "string" && product.imageUrl.trim()) ||
      (typeof product.image === "string" && product.image.trim()) ||
      (typeof product.imageURL === "string" && product.imageURL.trim()) ||
      undefined,
  );

  const normalizedImageUrls = rawImageUrls.length
    ? rawImageUrls.map((url) => toPublicProductImageUrl(url))
    : [primaryImage];

  return {
    id: product.id ?? "",
    name: product.name ?? product.title ?? "Product",
    slug: product.slug,
    description: product.description ?? "",
    imageUrl: primaryImage,
    imageUrls: normalizedImageUrls,
    price: toNumber(product.price),
    comparePrice:
      product.comparePrice !== undefined
        ? toNumber(product.comparePrice)
        : undefined,
    sku: product.sku,
    categoryId: resolveCategoryId(product),
    categoryName: resolveCategoryName(product),
    isActive: product.isActive ?? true,
    stock: toNumber(product.stock),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const normalizePaginatedProducts = (
  payload: PaginatedResponse<RawProduct>,
): PaginatedResponse<Product> => {
  return {
    ...payload,
    data: payload.data.map(normalizeProduct),
  };
};

export const productsApi = {
  list: async (params: QueryParams): Promise<PaginatedResponse<Product>> => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedResponse<RawProduct>>
    >("/products", {
      params,
    });
    return normalizePaginatedProducts(data.data);
  },

  byId: async (id: string): Promise<Product> => {
    const { data } = await axiosInstance.get<ApiResponse<RawProduct>>(
      `/products/${id}`,
    );
    return normalizeProduct(data.data);
  },

  related: async (categoryId: string): Promise<Product[]> => {
    const { data } = await axiosInstance.get<ApiResponse<RawProduct[]>>(
      "/products/related",
      {
        params: { categoryId },
      },
    );
    return data.data.map(normalizeProduct);
  },

  adminList: async (
    params: AdminProductQuery,
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedResponse<RawProduct>>
    >("/products", {
      params,
    });
    return normalizePaginatedProducts(data.data);
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await axiosInstance.post<ApiResponse<RawProduct>>(
      "/products",
      payload,
    );
    return normalizeProduct(data.data);
  },
  update: async (
    id: string,
    payload: ProductPayload,
  ): Promise<Product> => {
    const { data } = await axiosInstance.patch<ApiResponse<RawProduct>>(
      `/products/${id}`,
      payload,
    );
    return normalizeProduct(data.data);
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },
};
