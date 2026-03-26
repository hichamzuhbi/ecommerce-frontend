import type { CartItem } from "./cart.types";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

export type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "COD";

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  totalAmount?: number;
  status: OrderStatus;
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  paymentMethod: PaymentMethod;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  paymentMethod?: PaymentMethod;
}

export interface AdminOrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: "PAID" | "UNPAID" | "REFUNDED";
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
