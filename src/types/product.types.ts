export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  price: number;
  comparePrice?: number;
  sku?: string;
  categoryId: string;
  categoryName: string;
  isActive?: boolean;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  isActive: boolean;
  imageUrls: string[];
}
