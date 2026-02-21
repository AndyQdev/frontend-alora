export interface ProductMetadata {
  isFeatured?: boolean;
  tags?: string[];
  specifications?: Record<string, string>;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  icon?: string | null;
  productCount?: number; // Conteo de productos de la categoría
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrls?: string[];
  sku?: string;
  metadata?: ProductMetadata;
  brand?: Brand;
  category?: Category;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  statusCode: number;
  data: Product[];
  countData: number;
}

export interface ProductQueryParams {
  limit?: number;
  offset?: number;
  order?: 'ASC' | 'DESC';
  attr?: string;
  value?: string;
  categoryId?: string;
  brandId?: string;
}
