import { StoresGrid } from "@/features/store/ui/StoresGrid";
import { useStores } from "@/entities/store/api";

export function StoresPage() {
  const { data, isLoading } = useStores();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Tiendas</h1>
        <p className="text-muted-foreground mt-1">Administra todas tus tiendas online</p>
      </div>
      
      <StoresGrid stores={data || []} isLoading={isLoading} />
    </div>
  );
}
