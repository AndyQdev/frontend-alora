import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/client";
import type { Product } from "../model/types";
import type { ProductInput } from "../model/schema";

export function useProducts() {
  return useQuery<Product[]>({ queryKey: ["products"], queryFn: () => apiFetch<Product[]>("/products") });
}
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductInput) => apiFetch<Product>("/products", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] })
  });
}
