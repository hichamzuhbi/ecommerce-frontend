import type { Product } from "./product.types";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface AddCartItemInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}
