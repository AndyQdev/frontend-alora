import * as React from "react"
import {
  ShoppingCart,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react"

import { NavMain } from "@/widgets/layout/nav-main"
import { NavUser } from "@/widgets/layout/nav-user"
import { StoreSwitcher } from "@/widgets/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/ui/sidebar"

// Datos de ejemplo para el usuario - Luego esto vendrá del backend
const data = {
  user: {
    name: "Usuario Demo",
    email: "usuario@ecommerce.com",
    avatar: "/avatars/user.jpg",
  },
  // Navegación principal según vistas.md (orden por frecuencia de uso)
  navMain: [
    {
      title: "Caja",
      url: "/caja",
      icon: ShoppingCart,
    },
    {
      title: "Pedidos",
      url: "/orders",
      icon: ClipboardList,
    },
    {
      title: "Productos",
      url: "/products",
      icon: Package,
      items: [
        {
          title: "Inventario",
          url: "/inventory",
        },
      ],
    },
    {
      title: "Clientes",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Reportes",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Configuración",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
