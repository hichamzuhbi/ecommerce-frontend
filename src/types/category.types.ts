export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string | null;
  productCount?: number;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string;
  imageUrl?: string;
}
