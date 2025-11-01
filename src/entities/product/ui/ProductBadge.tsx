import type { Product } from "../model/types";
export default function ProductBadge({ product }: { product: Product }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
      <strong>{product.name}</strong> — ${product.price.toFixed(2)}
    </span>
  );
}
