import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/client";
import type { Product, ProductsResponse, ProductQueryParams, Category, Brand } from "../model/types";
import type { ProductInput } from "../model/schema";

export function useProducts(params: ProductQueryParams = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.order) queryParams.append('order', params.order);
  if (params.attr && params.value) {
    queryParams.append('attr', params.attr);
    queryParams.append('value', params.value);
  }
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.brandId) queryParams.append('brandId', params.brandId);

  return useQuery<ProductsResponse>({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await apiFetch<Product[]>(`/api/product?${queryParams.toString()}`);
      return {
        statusCode: response.statusCode,
        data: response.data || [],
        countData: response.countData || 0
      };
    }
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiFetch<Category[]>('/api/category');
      return response.data || [];
    }
  });
}

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await apiFetch<Brand[]>('/api/brand');
      return response.data || [];
    }
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductInput) => {
      const response = await apiFetch<Product>("/api/product", { method: "POST", body: data });
      return response.data as Product;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] })
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductInput> }) => {
      const response = await apiFetch<Product>(`/api/product/${id}`, { method: "PATCH", body: data });
      return response.data as Product;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] })
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/product/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] })
  });
}
