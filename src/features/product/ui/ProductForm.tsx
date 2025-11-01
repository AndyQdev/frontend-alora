import { productSchema, type ProductInput } from "@/shared/validation";
import { useCreateProduct } from "@/entities/product/api";
import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export default function ProductForm() {
  const { mutate, isPending } = useCreateProduct();
  const [form, setForm] = useState<ProductInput>({ name: "", price: 0, status: "active" });

  function submit() {
    const parsed = productSchema.safeParse({ ...form, price: Number(form.price) });
    if (parsed.success) mutate(parsed.data);
    else alert(parsed.error.issues.map(i => i.message).join("\\n"));
  }

  return (
    <div className="space-y-2 max-w-md">
      <Input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Precio" type="number" value={String(form.price)} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
      <Button onClick={submit} disabled={isPending}>Crear producto</Button>
    </div>
  );
}
