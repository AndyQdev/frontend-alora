export interface Inventory {
  id: string;
  stockQuantity: number;
  reservedQuantity: number;
  status: 'disponible' | 'agotado' | 'reservado';
  product: {
    id: string;
    name: string;
    sku: string;
    imageUrls?: string[];
    price?: number;
  };
  store: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  uniqueProducts: number;
  totalUnits: number;
  totalValue: number;
  outOfStock: number;
}

export interface InventoryResponse {
  statusCode: number;
  data: Inventory[];
  countData: number;
  stats?: InventoryStats;
}

export interface InventoryQueryParams {
  limit?: number;
  offset?: number;
  order?: 'ASC' | 'DESC';
  attr?: string;
  value?: string;
  storeId?: string;
  categoryId?: string; // Filtrar por categoría
}
