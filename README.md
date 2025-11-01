# Proyecto Frontend - Estructura FSD

Este proyecto sigue la arquitectura Feature-Sliced Design (FSD) para mantener una estructura escalable, modular y profesional.

## Requisitos del entorno

Antes de comenzar, asegurate de tener instalado:

- Node.js v18.x o superior
- VS Code
- Yarn o npm

## Estructura del proyecto

src/
├── app/           ← Bootstrap global (router, providers, layout)
├── shared/        ← Infraestructura común (UI base, config, helpers)
├── entities/      ← Modelos de dominio (product, order, etc.)
├── features/      ← Acciones de usuario (login, crear producto...)
├── widgets/       ← Componentes grandes, reutilizables (Navbar, Sidebar)
└── pages/         ← Rutas (productos, login, órdenes, etc.)

## Convenciones importantes

- shared/: sin lógica de negocio. Solo componentes reutilizables globales (Button, Input, helpers, config).
- entities/: define estructuras de datos y lógica mínima por dominio (ej: Product, Order).
- features/: cada acción del usuario va en un slice propio (formulario de login, crear producto...).
- pages/: pantallas completas que arman la UI usando widgets/features. No contiene lógica.

## Extensiones recomendadas para VS Code

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Zod Snippets (opcional)
- Path Intellisense

## Cómo iniciar el proyecto

npm install
npm run dev

## Temas y estilos

- Tailwind está configurado con tema extendido en tailwind.config.js
- Colores del proyecto definidos en shared/config/colors.ts
- Componentes base (botones, inputs, etc.) viven en shared/ui

## Librerías principales

- React 18 + Vite
- TailwindCSS
- shadcn/ui
- React Hook Form + Zod
- React Router DOM
- TanStack React Query
- OpenAPI client (generado desde backend NestJS)

## Arquitectura FSD

Para mantener orden y claridad, seguimos feature-sliced.design como referencia.

Cada slice tiene carpetas como:

product/
├── ui/        → componentes visuales del slice
├── model/     → hooks, validaciones, estado local
├── api/       → hooks de React Query (queries, mutations)

## Cómo empezar a programar

1. Navegá a features/product/ui/ y creá o editá formularios
2. Para lógica, usá features/product/model/
3. Si necesitás tipos, usá entities/product/model/types.ts
4. Toda consulta al backend va en entities/*/api
5. No uses fetch directo, siempre pasá por los hooks

## Linter y formateo

npm run lint
npm run format

## Generador OpenAPI (si aplica)

npm run generate:api

## Autenticación

- Contexto de sesión va en app/providers/AuthProvider.tsx
- Login y Register están en features/login/ y features/register/

## Testing (si aplica más adelante)

- Testeá componentes con Vitest + React Testing Library
- Estructura recomendada: __tests__/ o archivos .test.tsx al lado del componente
