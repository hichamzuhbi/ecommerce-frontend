import { axiosInstance } from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import type {
  AdminOrderFilters,
  CreateOrderInput,
  Order,
  OrderStatus,
} from "../types/order.types";
import type { Product } from "../types/product.types";
import { API_BASE_URL } from "../utils/constants";

const PLACEHOLDER = "https://placehold.co/600x600?text=Product";

const toPublicUrl = (value: string | undefined): string => {
  const s = (value ?? "").trim();
  if (!s) return PLACEHOLDER;
  if (s.startsWith("http") || s.startsWith("data:")) return s;
  if (s.startsWith("/")) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${origin}${s}`;
  }
  return s;
};

const normalizeOrderProduct = (
  p: Partial<Product> & Record<string, unknown>,
): Product => {
  const imageUrls = (p.imageUrls ?? []) as string[];
  const imageUrl = toPublicUrl(
    (p.imageUrl as string | undefined) ?? imageUrls.find((u) => !!u),
  );
  return {
    id: (p.id as string) ?? "",
    name: (p.name as string) ?? "Product",
    description: (p.description as string) ?? "",
    imageUrl,
    imageUrls: imageUrls.length ? imageUrls.map(toPublicUrl) : [imageUrl],
    price: Number(p.price) || 0,
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    sku: p.sku as string | undefined,
    categoryId: (p.categoryId as string) ?? "",
    categoryName: (p.categoryName as string) ?? "Uncategorized",
    isActive: (p.isActive as boolean) ?? true,
    stock: Number(p.stock) || 0,
    createdAt: p.createdAt as string | undefined,
    updatedAt: p.updatedAt as string | undefined,
    slug: p.slug as string | undefined,
  };
};

const normalizeOrder = (order: Order): Order => ({
  ...order,
  total: Number(order.total) || 0,
  totalAmount:
    order.totalAmount !== undefined ? Number(order.totalAmount) : undefined,
  items: (order.items ?? []).map((item) => ({
    ...item,
    product: normalizeOrderProduct(
      item.product as unknown as Partial<Product> & Record<string, unknown>,
    ),
  })),
});

export const ordersApi = {
  list: async (): Promise<Order[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Order[]>>("/orders");
    return (data.data ?? []).map(normalizeOrder);
  },

  byId: async (id: string): Promise<Order> => {
    const { data } = await axiosInstance.get<ApiResponse<Order>>(
      `/orders/${id}`,
    );
    return normalizeOrder(data.data);
  },

  create: async (payload: CreateOrderInput): Promise<Order> => {
    const shippingAddress = {
      street: payload.shippingAddress.address,
      city: payload.shippingAddress.city,
      state: payload.shippingAddress.city,
      country: payload.shippingAddress.country,
      zipCode: payload.shippingAddress.zipCode,
    };

    const { data } = await axiosInstance.post<ApiResponse<Order>>("/orders", {
      shippingAddress,
    });
    return data.data;
  },

  adminAll: async (filters: AdminOrderFilters): Promise<Order[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Order[]>>(
      "/orders/admin/all",
      {
        params: filters,
      },
    );
    const payload = data.data as unknown;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as { data?: unknown }).data)
    ) {
      return (payload as { data: Order[] }).data;
    }

    return [];
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const { data } = await axiosInstance.patch<ApiResponse<Order>>(
      `/orders/admin/${id}/status`,
      { status },
    );
    return data.data;
  },
};
