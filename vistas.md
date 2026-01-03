1. Principio rector del layout

Grábate esta regla (es la más importante):

La acción principal del sistema es VENDER.
Todo lo demás existe para apoyar esa acción.

Por eso:

La Caja debe ser la vista principal.

El sidebar debe ordenarse por frecuencia de uso, no por entidades técnicas.

2. Layout general
Estructura base

Sidebar izquierdo (navegación)

Header superior:

Selector de tienda

Nombre de la tienda activa

Perfil de usuario

Área central:

Vista activa

El usuario siempre trabaja dentro de una tienda activa.

3. Sidebar propuesto (final, básico y profesional)
Orden recomendado (de arriba hacia abajo)

Caja

Pedidos

Productos

Inventario

Clientes

Reportes

Configuración

Este orden no es casual.

4. Vista 1: Caja (Home)
Por qué es la Home

Es la vista más usada

Es donde se genera dinero

Sirve para ventas:

Presenciales

Por WhatsApp

Rápidas

Qué debe permitir hacer

Buscar productos (nombre / código)

Ver productos disponibles (según inventario)

Agregar productos al “carrito de caja”

Ajustar cantidades

Ver subtotal y total en tiempo real

Finalizar venta

Qué tablas toca

store_products (precio, catálogo)

inventory (disponibilidad)

orders

order_items

👉 No se crean productos aquí, solo se venden.

5. Vista 2: Pedidos
Objetivo

Gestionar todo lo que ya se vendió.

Qué muestra

Lista de pedidos:

Fecha

Cliente

Estado

Total

Filtros por:

Estado

Fecha

Acciones

Ver detalle

Cambiar estado:

pending → paid → completed

cancelar

Tablas

orders

order_items

6. Vista 3: Productos
Objetivo

Gestionar el catálogo (qué se vende).

Qué se hace aquí

Crear productos globales

Editar descripción

Asignar marca

Subir imágenes

Importante

Aquí NO se define precio ni stock.

Tablas

products

brands

7. Vista 4: Inventario
Objetivo

Controlar stock real y cómo se vende en la tienda.

Esta vista une dos conceptos, pero el usuario lo entiende como uno.

Secciones internas

Listado de productos en la tienda

Para cada producto:

Precio de venta

Stock disponible

Estado (activo / sin stock)

Acciones

Ajustar stock

Definir precio

Activar / desactivar producto en la tienda

Tablas

store_products

inventory

👉 El usuario siente:

“Aquí administro lo que tengo y a cuánto lo vendo”.

No piensa en tablas.

8. Vista 5: Clientes
Objetivo

Ver a quién le vendes.

Qué muestra

Lista de clientes

Total comprado

Historial de pedidos

Tablas

orders

9. Vista 6: Reportes
Objetivo

Responder preguntas simples del negocio.

Ejemplos

Ventas del día / mes

Productos más vendidos

Stock crítico

Ingresos totales

Tablas

orders

order_items

inventory

10. Vista 7: Configuración
Objetivo

Configurar la tienda, no vender.

Secciones

Datos de la tienda

Logo y colores

Métodos de pago

Usuarios (futuro)

Preferencias

Tablas

stores

users

11. Por qué NO pongo categorías en el sidebar

Categorías:

Son internas al inventario

No se usan todos los días

No son acción principal

Las gestionas:

Desde Inventario

O como sub-vista de Productos

12. Mapeo rápido: vista → tablas
Vista	Tablas
Caja	store_products, inventory, orders, order_items
Pedidos	orders, order_items
Productos	products, brands
Inventario	store_products, inventory
Clientes	orders
Reportes	orders, order_items, inventory
Configuración	stores, users
13. Flujo mental del usuario (clave UX)

Entra al sistema

Está en Caja

Vende

Ve pedido en Pedidos

Si falta stock → va a Inventario

Si quiere agregar algo nuevo → Productos

Configura una vez → Configuración

👉 Flujo natural, sin fricción.

