import ProductForm from "@/features/product/ui/ProductForm";
import ProductList from "@/features/product/ui/ProductList";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">📦 Inventario</h2>
      <ProductForm />
      <ProductList />
    </div>
  );
}
