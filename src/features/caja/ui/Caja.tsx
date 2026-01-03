import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { Loader2 } from "lucide-react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  ShoppingCart,
  CreditCard,
  Banknote,
  Grid3x3,
  Coffee,
  Soup,
  UtensilsCrossed,
  Beef,
  Sandwich,
  QrCode,
  Building2,
  Filter,
  ScanLine,
  ChevronLeft,
  ChevronRight,
  User,
  Apple,
  Milk,
  Droplets,
  Boxes,
  Sparkles,
  ShoppingBag,
  Cookie,
  type LucideIcon
} from "lucide-react";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";
import { useCustomers, useCreateCustomer, type Customer } from "@/entities/customer";
import { useInfiniteInventory } from "@/entities/inventory/api";
import { useCategories } from "@/entities/product/api";
import { useStore } from "@/app/providers/auth";
import { ComboBoxClient, CreateClientModal, SheetMovileCart } from "./";

// Función helper para obtener ícono basado en el nombre de la categoría
const getCategoryIcon = (name: string, iconName?: string | null): LucideIcon => {
  // Si viene un icono del backend, intentar usarlo
  if (iconName) {
    const iconMap: Record<string, LucideIcon> = {
      Package, Coffee, Sandwich, Beef, Soup, UtensilsCrossed, Grid3x3,
      Apple, Milk, Droplets, Boxes, Sparkles, ShoppingBag, Cookie
    };
    if (iconMap[iconName]) return iconMap[iconName];
  }

  // Sino, inferir del nombre
  const nameLower = name.toLowerCase();
  if (nameLower.includes('lácteo') || nameLower.includes('lacteo') || nameLower.includes('leche')) return Milk;
  if (nameLower.includes('pan') || nameLower.includes('panadería')) return Sandwich;
  if (nameLower.includes('carne') || nameLower.includes('pollo')) return Beef;
  if (nameLower.includes('bebida') || nameLower.includes('jugo') || nameLower.includes('refresco')) return Soup;
  if (nameLower.includes('snack') || nameLower.includes('galleta') || nameLower.includes('dulce')) return Cookie;
  if (nameLower.includes('fruta') || nameLower.includes('verdura')) return Apple;
  if (nameLower.includes('abarrote') || nameLower.includes('despensa')) return Boxes;
  if (nameLower.includes('limpieza') || nameLower.includes('higiene')) return Sparkles;
  if (nameLower.includes('aceite') || nameLower.includes('condimento')) return Droplets;
  if (nameLower.includes('enlata')) return Package;
  
  // Por defecto
  return ShoppingBag;
};

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Efectivo', icon: Banknote },
  { id: 'qr', name: 'QR', icon: QrCode },
  { id: 'card', name: 'Tarjeta', icon: CreditCard },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
}

export default function Caja() {
  // Ref para el observador de intersección
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { selectedStore } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch de categorías del backend
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories();
  const backendCategories: any[] = categoriesResponse || [];

  // Construir array de categorías con iconos
  const CATEGORIES = useMemo(() => {
    const allCategory = { id: 'all', name: "Todos", icon: Grid3x3 };
    const mappedCategories = backendCategories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      icon: getCategoryIcon(cat.name, cat.icon)
    }));
    return [allCategory, ...mappedCategories];
  }, [backendCategories]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Determinar storeId basado en la tienda seleccionada
  const storeId = selectedStore === "all" ? "all" : (selectedStore?.id || "all");

  // Hook de inventario con scroll infinito
  const {
    data: inventoryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInventory,
  } = useInfiniteInventory({
    order: "DESC",
    storeId,
    pageSize: 8,
    ...(debouncedSearch && { attr: "product.name", value: debouncedSearch }),
  });

  // Debounce del término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Estados para clientes
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [prefilledClientName, setPrefilledClientName] = useState("");
  
  // Estado para Sheet del carrito en móvil
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  // Hooks de clientes
  const { data: customersData, isLoading: isLoadingClients } = useCustomers({
    limit: 100,
    attr: clientSearch.trim() ? 'name' : undefined,
    value: clientSearch.trim() || undefined,
  });
  const createCustomerMutation = useCreateCustomer();

  // Clientes filtrados para el dropdown
  const displayedClients = useMemo(() => {
    if (!customersData?.data) return [];
    
    const search = clientSearch.toLowerCase().trim();
    if (!search) return customersData.data;

    return customersData.data.filter(client => 
      client.name.toLowerCase().includes(search) ||
      (client.phone && client.phone.includes(search))
    );
  }, [customersData, clientSearch]);

  // Productos del inventario aplanados
  const allProducts = useMemo(() => {
    if (!inventoryData) return [];
    const pages = ('pages' in inventoryData ? inventoryData.pages : []) as any[];
    return pages.flatMap((page: any) => 
      page.data.map((inventory: any) => ({
        id: inventory.id,
        name: inventory.product.name,
        price: inventory.product.price || 0,
        stock: inventory.stockQuantity,
        imageUrl: inventory.product.imageUrls?.[0],
        category: "Todos", // Por ahora todas las categorías en "Todos"
      }))
    );
  }, [inventoryData]);

  // Abrir Sheet automáticamente en móvil cuando se agrega un producto
  useEffect(() => {
    if (cart.length > 0 && window.innerWidth < 1024) {
      setCartSheetOpen(true);
    }
  }, [cart.length]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1, // Reducido de 0.5 a 0.1 para activar antes
        rootMargin: '200px' // Se activa 200px antes de que el sentinel sea visible
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Contar productos por categoría
  const getProductCountByCategory = (categoryId: string) => {
    if (categoryId === "all") return allProducts.length;
    // TODO: Cuando el backend envíe categoryId en inventory, filtrar por eso
    return allProducts.length; // Por ahora retornar todos
  };

  // Filtrar productos (por ahora solo por stock, búsqueda y categoría se harán en el backend)
  const filteredProducts = allProducts.filter(product => {
    const matchesStock = !showOnlyInStock || product.stock > 0;
    return matchesStock;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Scroll de categorías
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 300;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Agregar producto al carrito
  const addToCart = useCallback((product: typeof allProducts[0]) => {
    if (product.stock === 0) return;

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        imageUrl: product.imageUrl,
      }]);
    }
  }, [cart]);

  // Incrementar cantidad
  const incrementQuantity = (id: string) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity < item.stock
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  // Decrementar cantidad
  const decrementQuantity = (id: string) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };

  // Eliminar item del carrito
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Por ahora sin descuentos

  // Crear nuevo cliente
  const handleCreateClient = async (data: { name: string; phone: string }) => {
    try {
      const newClient = await createCustomerMutation.mutateAsync(data);
      setSelectedClient(newClient);
      setShowClientModal(false);
      setPrefilledClientName("");
      toast.success("Cliente creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el cliente");
      throw error;
    }
  };

  // Finalizar venta
  const finalizeSale = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    
    if (!selectedClient) {
      toast.error("Debes seleccionar un cliente");
      return;
    }
    
    // TODO: Aquí irá la lógica real de crear order
    alert(`Venta finalizada!\nTotal: Bs. ${total.toFixed(2)}\nMétodo: ${paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}`);
    setCart([]);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive" className="text-xs">Agotado</Badge>;
    if (stock < 10) return <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">Quedan {stock}</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">Stock: {stock}</Badge>;
  };

  return (
    <div className="relative h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)] min-w-0 overflow-hidden">
      {/* Layout: Catálogo + Carrito */}
        <div className="grid h-full gap-4 grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px]">
            <div className="flex flex-col gap-3 sm:gap-4 min-w-0 h-full overflow-hidden">
                    {/* Búsqueda con botones laterales */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 hidden sm:flex"
                        >
                        <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        
                        <div className="relative flex-1">
                        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 sm:pl-12 pr-4 h-10 sm:h-12 text-sm sm:text-base"
                            autoFocus
                        />
                        </div>
                        
                        <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 hidden sm:flex"
                        >
                        <ScanLine className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>

                    {/* Categorías con scroll horizontal */}
                    <div className="relative w-full min-w-0">
                        {/* Botón izquierda */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md hidden sm:flex"
                            onClick={() => scrollCategories('left')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div 
                            ref={categoriesRef}
                            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth px-1 sm:px-10"
                        >
                            {CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            const isActive = selectedCategory === category.id;
                            const productCount = getProductCountByCategory(category.id);

                            return (
                                <Card
                                key={category.id}
                                className={`shrink-0 w-[110px] sm:w-[140px] p-3 sm:p-4 cursor-pointer transition-all ${
                                    isActive
                                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 shadow-md'
                                    : 'hover:border-emerald-200 shadow-sm'
                                }`}
                                onClick={() => setSelectedCategory(category.id)}
                                >
                                <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-center">
                                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                                    isActive ? 'bg-emerald-200/50' : 'bg-emerald-100/50'
                                    }`}>
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                    </div>

                                    <div className="w-full">
                                    <span className="text-[10px] sm:text-xs font-semibold block truncate">
                                        {category.name}
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block mt-0.5">
                                        {productCount} producto{productCount !== 1 ? 's' : ''}
                                    </span>
                                    </div>
                                </div>
                                </Card>
                            );
                            })}
                        </div>

                        {/* Botón derecha */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md hidden sm:flex"
                            onClick={() => scrollCategories('right')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            {/* Grid de productos */}
            <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoadingInventory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
                    <p className="text-lg text-muted-foreground">Cargando productos...</p>
                  </div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">No se encontraron productos</p>
                    <p className="text-sm text-muted-foreground mt-1">Intenta con otro filtro o búsqueda</p>
                </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-4">
                {filteredProducts.map(product => (
                    <Card
                    key={product.id}
                    className={`group relative overflow-hidden transition-all duration-200 ${
                        product.stock === 0 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'cursor-pointer hover:shadow-sm hover:border-emerald-300'
                    }`}
                    onClick={() => addToCart(product)}
                    >
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                        <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">AGOTADO</span>
                        </div>
                        )}
                    </div>
                    <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-emerald-600">
                            Bs. {product.price.toFixed(2)}
                        </p>
                        {getStockBadge(product.stock)}
                        </div>
                    </div>
                    {product.stock > 0 && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-primary text-primary-foreground rounded-full p-1.5">
                            <Plus className="h-4 w-4" />
                        </div>
                        </div>
                    )}
                    </Card>
))}
                
                {/* Skeletons para infinite scroll */}
                {isFetchingNextPage && (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Card key={`skeleton-${index}`} className="overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex items-center justify-between pt-1">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
                
                {/* Sentinel para infinite scroll (invisible) */}
                <div ref={loadMoreRef} className="col-span-full h-1" />
                </div>
            )}
            </div>
        </div>

        {/* Botón flotante del carrito para móvil */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            onClick={() => setCartSheetOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all relative"
          >
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 hover:bg-red-600">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>

        {/* Panel del Carrito */}
        <div className="bg-white border-l rounded-tl-3xl rounded-bl-3xl overflow-hidden hidden lg:block">
            <div className="h-full flex flex-col overflow-hidden">
            {/* Header del carrito */}
            <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-3 lg:pb-4 bg-white">
                {/* Select de cliente con botón de limpiar carrito */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Cliente
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <ComboBoxClient
                        selectedClient={selectedClient}
                        clientSearch={clientSearch}
                        clientSearchOpen={clientSearchOpen}
                        displayedClients={displayedClients}
                        isLoadingClients={isLoadingClients}
                        setClientSearch={setClientSearch}
                        setClientSearchOpen={setClientSearchOpen}
                        onSelectClient={setSelectedClient}
                        onCreateNew={(name) => {
                          setPrefilledClientName(name);
                          setShowClientModal(true);
                        }}
                      />
                    </div>
                    {cart.length > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCart([])}
                        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive"
                        title="Limpiar carrito"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
            </div>

            {/* Items del carrito */}
            <div className="flex-1 overflow-y-auto px-3 lg:px-4 bg-white">
                {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                    <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm">Carrito vacío</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Selecciona productos para comenzar
                    </p>
                    </div>
                </div>
                ) : (
                <div className="space-y-2 py-2">
                    {cart.map((item) => {
                      const product = allProducts.find(p => p.id === item.id);
                      return (
                    <Card key={item.id} className="flex gap-3 p-3 shadow-sm hover:shadow-md transition-shadow">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                            src={product?.imageUrl || ''}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                        </div>
                        
                        {/* Info del producto */}
                        <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                            {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                            Bs. {item.price.toFixed(2)}
                        </p>
                        
                        {/* Stepper de cantidad */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-muted/50 rounded-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-background"
                                onClick={() => decrementQuantity(item.id)}
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-semibold text-xs w-8 text-center">
                                {item.quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-background"
                                onClick={() => incrementQuantity(item.id)}
                                disabled={item.quantity >= item.stock}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            </div>
                            
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                            >
                            <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                        </div>
                        
                        {/* Precio total del item */}
                        <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-emerald-600">
                            Bs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                        </div>
                    </Card>
                      );
                    })}
                </div>
                )}
            </div>

            {/* Resumen pegado abajo */}
            <div className="bg-white p-3 lg:p-4 space-y-2 lg:space-y-2.5">
                {/* Card de totales con fondo gris pastel */}
                <Card className="bg-slate-50/50 border-slate-200/50 p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Bs. {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="font-medium">Bs. 0.00</span>
                </div>
                
                <Separator className="my-1.5" />
                
                <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-xl font-bold">
                    Bs. {total.toFixed(2)}
                    </span>
                </div>
                </Card>

                {/* Métodos de pago en cards */}
                <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isActive = paymentMethod === method.id;
                    return (
                        <Card
                        key={method.id}
                        className={`p-2.5 cursor-pointer transition-all ${
                            isActive 
                            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700' 
                            : 'hover:border-emerald-200 bg-card'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                        >
                        <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className={`p-1.5 rounded-lg ${
                            isActive ? 'bg-emerald-200/50 dark:bg-emerald-900/50' : 'bg-emerald-100/50 dark:bg-emerald-900/30'
                            }`}>
                            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-medium">
                            {method.name}
                            </span>
                        </div>
                        </Card>
                    );
                    })}
                </div>
                </div>

                {/* Botón finalizar */}
                <Button
                className="w-full h-11 text-sm font-bold"
                size="lg"
                onClick={finalizeSale}
                disabled={cart.length === 0}
                >
                Finalizar Venta
                </Button>
            </div>
            </div>
        </div>
        </div>

      {/* Sheet del carrito para móvil */}
      <SheetMovileCart
        cartSheetOpen={cartSheetOpen}
        setCartSheetOpen={setCartSheetOpen}
        cart={cart}
        setCart={setCart}
        products={allProducts}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        clientSearch={clientSearch}
        setClientSearch={setClientSearch}
        clientSearchOpen={clientSearchOpen}
        setClientSearchOpen={setClientSearchOpen}
        displayedClients={displayedClients}
        isLoadingClients={isLoadingClients}
        onCreateNewClient={(name) => {
          setPrefilledClientName(name);
          setShowClientModal(true);
        }}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
        removeFromCart={removeFromCart}
        finalizeSale={finalizeSale}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentMethods={PAYMENT_METHODS}
      />

      {/* Modal de crear cliente */}
      <CreateClientModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        onSave={handleCreateClient}
        isCreating={createCustomerMutation.isPending}
        initialName={prefilledClientName}
      />
    </div>
  );
}
