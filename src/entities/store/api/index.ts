import { apiFetch } from "@/shared/api/client";
import { Store } from "../model/types";

export async function getStores(): Promise<Store[]> {
  const response = await apiFetch<Store[]>("/api/store", { method: "GET" });
  return response.data || [];
}

export async function getStoreById(id: string): Promise<Store> {
  const response = await apiFetch<Store>(`/api/store/${id}`, { method: "GET" });
  return response.data as Store;
}
