export type Permission = "products.read" | "products.write" | "orders.read" | "orders.write";
export const defaultPermissions: Permission[] = ["products.read", "orders.read"];
