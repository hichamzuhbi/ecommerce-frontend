import { axiosInstance } from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import type {
  AddCartItemInput,
  Cart,
  CartItem,
  UpdateCartItemInput,
} from "../types/cart.types";
import { resolveImageUrl } from "../utils/image.utils";

type RawCartProduct = Partial<CartItem["product"]> & {
  image?: string;
  imageURL?: string;
  images?: string[];
};

interface RawCartItem extends Omit<CartItem, "product"> {
  product?: RawCartProduct;
}

interface RawCart {
  items?: RawCartItem[];
  totalItems?: number;
  totalPrice?: number;
  subtotal?: number;
  totalAmount?: number;
  itemCount?: number;
}

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

const toPublicAssetUrl = (value: string): string => {
  return resolveImageUrl(value);
};

const normalizeCartItem = (item: RawCartItem): CartItem => {
  const product = item.product ?? {};
  const galleryImage =
    product.imageUrls?.find((url) => typeof url === "string" && url.trim()) ??
    product.images?.find((url) => typeof url === "string" && url.trim());

  const primaryImage = toPublicAssetUrl(
    product.imageUrl ?? product.image ?? product.imageURL ?? galleryImage ?? "",
  );

  return {
    ...item,
    product: {
      id: product.id ?? item.productId,
      name: product.name ?? "Product",
      description: product.description ?? "",
      imageUrl: primaryImage,
      imageUrls:
        product.imageUrls?.length && product.imageUrls[0]
          ? product.imageUrls.map((url) => toPublicAssetUrl(url))
          : [primaryImage],
      price: toNumber(product.price),
      comparePrice: toNumber(product.comparePrice) || undefined,
      sku: product.sku,
      categoryId: product.categoryId ?? "",
      categoryName: product.categoryName ?? "Uncategorized",
      isActive: product.isActive ?? true,
      stock: toNumber(product.stock),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      slug: product.slug,
    },
  };
};

const normalizeCart = (raw: RawCart): Cart => {
  const items = (raw.items ?? []).map(normalizeCartItem);

  const fallbackTotalItems = items.reduce(
    (sum, item) => sum + toNumber(item.quantity),
    0,
  );
  const fallbackTotalPrice = items.reduce(
    (sum, item) =>
      sum + toNumber(item.quantity) * toNumber(item.product?.price),
    0,
  );

  return {
    items,
    totalItems:
      toNumber(raw.totalItems) || toNumber(raw.itemCount) || fallbackTotalItems,
    totalPrice:
      toNumber(raw.totalPrice) ||
      toNumber(raw.subtotal) ||
      toNumber(raw.totalAmount) ||
      fallbackTotalPrice,
  };
};

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const { data } = await axiosInstance.get<ApiResponse<RawCart>>("/cart");
    return normalizeCart(data.data);
  },

  addItem: async (payload: AddCartItemInput): Promise<Cart> => {
    const { data } = await axiosInstance.post<ApiResponse<RawCart>>(
      "/cart/items",
      payload,
    );
    return normalizeCart(data.data);
  },

  updateItem: async ({
    itemId,
    quantity,
  }: UpdateCartItemInput): Promise<Cart> => {
    const { data } = await axiosInstance.patch<ApiResponse<RawCart>>(
      `/cart/items/${itemId}`,
      {
        quantity,
      },
    );
    return normalizeCart(data.data);
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const { data } = await axiosInstance.delete<ApiResponse<RawCart>>(
      `/cart/items/${itemId}`,
    );
    return normalizeCart(data.data);
  },

  clear: async (): Promise<Cart> => {
    const { data } = await axiosInstance.delete<ApiResponse<RawCart>>("/cart");
    return normalizeCart(data.data);
  },
};
