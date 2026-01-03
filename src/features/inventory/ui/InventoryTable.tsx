
import { useState, useEffect } from "react";
import { useInventory } from "@/entities/inventory/api";
import { useStore } from "@/app/providers/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { PaginationControls } from "@/shared/ui/pagination";
import { Search, Package, Boxes, DollarSign, AlertTriangle, Archive } from "lucide-react";

export default function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { selectedStore } = useStore();

  // Determinar el storeId basado en el store seleccionado
  const storeId = selectedStore === "all" ? "all" : (selectedStore?.id || "all");

  // Query params para el backend
  const queryParams = {
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    order: "DESC" as const,
    storeId, // Filtrar por tienda seleccionada
    ...(searchTerm && { attr: "product.name", value: searchTerm }),
  };

  const { data: inventoryResponse, isLoading } = useInventory(queryParams);
  console.log('Inventory Response:', inventoryResponse);
  const inventories = inventoryResponse?.data || [];
  const totalInventories = inventoryResponse?.countData || 0;
  const totalPages = Math.ceil(totalInventories / pageSize);
  const stats = inventoryResponse?.stats;

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible':
        return <Badge className="bg-green-500">Disponible</Badge>;
      case 'agotado':
        return <Badge variant="destructive">Agotado</Badge>;
      case 'reservado':
        return <Badge className="bg-yellow-500">Reservado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el stock de tus productos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg animate-pulse w-10 h-10" />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-24 animate-pulse mb-2" />
                  <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Productos Únicos */}
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Archive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos Únicos</p>
                <p className="text-2xl font-semibold">{stats.uniqueProducts}</p>
              </div>
            </div>
          </div>

          {/* Total Unidades */}
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Boxes className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unidades en Stock</p>
                <p className="text-2xl font-semibold">{stats.totalUnits}</p>
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-semibold">Bs. {stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Productos Agotados */}
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos Agotados</p>
                <p className="text-2xl font-semibold">{stats.outOfStock}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Search */}
      <div className="bg-card border rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos en inventario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tienda</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="text-right">En Tránsito</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-16 animate-pulse ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-12 animate-pulse ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-12 animate-pulse ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : inventories.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay inventarios</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No se encontraron productos con los filtros aplicados."
              : "No hay productos registrados en el inventario."}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tienda</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="text-right">En Tránsito</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventories.map((inventory) => (
                <TableRow key={inventory.id}>
                  <TableCell>
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      {inventory.product.imageUrls && inventory.product.imageUrls.length > 0 ? (
                        <img
                          src={inventory.product.imageUrls[0]}
                          alt={inventory.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inventory.product.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {inventory.product.sku ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {inventory.product.sku}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Sin código</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{inventory.store.name}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">
                      Bs. {inventory.product.price?.toFixed(2) || '0.00'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{inventory.stockQuantity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={inventory.reservedQuantity > 0 ? "font-semibold text-yellow-600" : ""}>
                      {inventory.reservedQuantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(inventory.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination pegada al table */}
          {!isLoading && inventories.length > 0 && (
            <div className="border-t p-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalInventories}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}