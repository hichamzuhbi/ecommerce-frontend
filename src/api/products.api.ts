/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from "./axios.instance";
import type {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "../types/api.types";
import type { Product } from "../types/product.types";
import type { ProductPayload } from "../types/product.types";
import { API_BASE_URL } from "../utils/constants";

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

const PRODUCT_PLACEHOLDER_IMAGE = "https://placehold.co/600x600?text=Product";

const VALID_DATA_IMAGE_REGEX =
  /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+$/;

const toPublicProductImageUrl = (value: string | undefined): string => {
  const candidate = (value ?? "").trim();

  if (!candidate) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }

  if (candidate.startsWith("data:")) {
    return VALID_DATA_IMAGE_REGEX.test(candidate)
      ? candidate
      : PRODUCT_PLACEHOLDER_IMAGE;
  }

  if (candidate.startsWith("/")) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${origin}${candidate}`;
  }

  return candidate;
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

    return toPublicProductImageUrl(url) !== PRODUCT_PLACEHOLDER_IMAGE;
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

const buildProductFormData = (
  payload: ProductPayload,
  uploads: FormData,
): FormData => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("slug", payload.slug);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("sku", payload.sku);
  formData.append("stock", String(payload.stock));
  formData.append("categoryId", payload.categoryId);
  formData.append("isActive", String(payload.isActive));

  if (typeof payload.comparePrice === "number") {
    formData.append("comparePrice", String(payload.comparePrice));
  }

  payload.imageUrls.forEach((url) => {
    formData.append("imageUrls", url);
  });

  uploads.getAll("images").forEach((file) => {
    if (file instanceof File) {
      formData.append("images", file);
    }
  });

  return formData;
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

  create: async (
    payload: ProductPayload,
    uploads: FormData | null = null,
  ): Promise<Product> => {
    const body = uploads ? buildProductFormData(payload, uploads) : payload;
    try {
      const { data } = await axiosInstance.post<ApiResponse<RawProduct>>(
        "/products",
        body,
        {
          headers: uploads
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
        },
      );
      return normalizeProduct(data.data);
    } catch (error: any) {
      console.log("=== Backend Error ===", error.response?.data);
      throw error;
    }
  },
  update: async (
    id: string,
    payload: ProductPayload,
    uploads: FormData | null = null,
  ): Promise<Product> => {
    const body = uploads ? buildProductFormData(payload, uploads) : payload;
    const { data } = await axiosInstance.patch<ApiResponse<RawProduct>>(
      `/products/${id}`,
      body,
      {
        headers: uploads
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      },
    );
    return normalizeProduct(data.data);
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },
};
