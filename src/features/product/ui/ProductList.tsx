import { useProducts } from "@/entities/product/api";
import ProductBadge from "@/entities/product/ui/ProductBadge";
import StatusPill from "@/entities/product/ui/StatusPill";

export default function ProductList() {
  const { data = [], isLoading } = useProducts();
  if (isLoading) return <div>Cargando...</div>;
  return (
    <ul className="space-y-2">
      {data.map(p => (
        <li key={p.id} className="flex items-center gap-2">
          <ProductBadge product={p} />
          <StatusPill status={p.status} />
        </li>
      ))}
    </ul>
  );
}
