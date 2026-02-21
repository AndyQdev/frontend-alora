🧠 CONTEXTO GENERAL: ¿qué hicimos y por qué?
🎯 Objetivo

Tener un sistema de e-commerce profesional, escalable y sin problemas al migrar servidores.

❌ Lo que evitamos

Guardar imágenes en el filesystem del backend

URLs acopladas al dominio del servidor

Migraciones dolorosas

Pérdida de imágenes

Backends “stateful”

✅ Lo que hicimos (resumen ejecutivo)
1️⃣ Base de datos y storage desacoplados

Base de datos → Supabase Postgres

Imágenes → Supabase Storage

Backend (NestJS) → solo lógica, NO archivos

👉 El backend ahora es stateless.

2️⃣ Estructura profesional de imágenes

Creamos un bucket:

users


Y definimos una estructura por usuario:

users/
 └── {auth.uid}/
      ├── products/
      │    └── product-id.webp
      ├── profile/
      │    └── avatar.webp


✔ Cada usuario está aislado
✔ Fácil de escalar a marketplace
✔ Fácil de auditar y borrar

3️⃣ Policies de seguridad (lo más importante)

Creamos policies claras y separadas:

🔓 Lectura pública

Cualquiera puede ver imágenes (normal en e-commerce)

🔐 Escritura protegida

Un usuario solo puede subir/borrar archivos en su carpeta

Validado con:

auth.uid() = primer_folder_del_path


👉 Seguridad real, no solo “bucket público”.

4️⃣ Qué se guarda en la base de datos

En la BD NO guardas archivos, solo URLs:

Product {
  id
  name
  price
  image_url  // URL pública de Supabase Storage
}


Ejemplo real:

https://xxxx.supabase.co/storage/v1/object/public/users/UID/products/123.webp


✔ Esa URL no cambia nunca
✔ Migras backend sin tocar nada

🧩 CÓMO APLICAR ESTO EN TU PROYECTO (práctico)
Arquitectura final (mental y técnica)
Frontend (React / Next)
   │
   ├── selecciona imagen
   ├── (opcional) optimiza
   └── sube a Supabase Storage
            │
            └── devuelve URL pública
                   │
                   ▼
Backend (NestJS)
   └── guarda URL en la BD

🖼️ ¿Dónde transformar la imagen?

Esta es tu duda clave 👇
La respuesta correcta es: DEPENDE, pero te doy la regla profesional.

✅ Opción A (RECOMENDADA): transformar en el FRONTEND
Qué hacer en frontend

Redimensionar (ej. 1024px max)

Convertir a webp

Reducir calidad (70–80)

Ventajas

🚀 Menos carga al backend

💸 Menos costos

⚡ Subida más rápida

📱 Mejor UX

🔥 Escala mejor

Librerías útiles

browser-image-compression

canvas

sharp ❌ (NO en frontend)

Web APIs (Canvas, ImageBitmap)

👉 90% de e-commerce modernos hacen esto.

2da parte:
CONTEXTO DE ARQUITECTURA – ALMACENAMIENTO DE IMÁGENES (DECISIÓN FINAL)
Decisión tomada

Se descarta el uso de Supabase Auth como sistema de autenticación principal.

Se mantiene el sistema actual de autenticación, roles y permisos del backend (NestJS + JWT propio + tabla user).

Se elige la Opción 1:

Subir imágenes a Supabase Storage exclusivamente desde el BACKEND usando la Service Role Key.

El frontend NO interactúa directamente con Supabase Storage.

Motivación de la decisión

El backend ya tiene:

sistema de login y registro propio

JWT propio

roles y permisos avanzados

relaciones complejas (stores, products, brands, categories, customers)

Supabase Auth:

no conoce nuestra tabla user

no puede usar nuestros JWT

obligaría a duplicar o reescribir el sistema de auth

Supabase Storage:

permite bypass completo de RLS usando SERVICE_ROLE_KEY

puede usarse como object storage puro, sin auth

Por lo tanto:

Supabase se usa solo como infraestructura

El backend sigue siendo la única fuente de verdad

Arquitectura final
Flujo general

El usuario se autentica usando el login propio del backend

El frontend envía la imagen al backend (multipart/form-data)

El backend:

valida el JWT propio

valida permisos/roles

procesa la imagen (opcional)

sube la imagen a Supabase Storage usando SERVICE_ROLE_KEY

El backend guarda solo la URL pública en la base de datos

El frontend consume la URL directamente (CDN de Supabase)

Componentes y responsabilidades
Frontend

Seleccionar imagen

Enviar imagen al backend

NO usar Supabase SDK

NO manejar keys de Supabase

NO subir archivos directamente a Storage

Backend (NestJS)

Responsabilidades:

Autenticación

Autorización (roles/permisos)

Subida de imágenes

Generación de rutas

Persistencia de URLs

El backend es el único actor autorizado para escribir en Supabase Storage.

Supabase

Se usa únicamente para:

Storage (bucket público)

CDN

URLs estables

NO se usa:

Supabase Auth

Supabase RLS por usuario

Supabase JWT

Configuración de Supabase Storage
Bucket

Nombre: users

Tipo: Public

Restricciones:

Tamaño máximo: 5 MB

MIME types permitidos: image/webp,image/jpeg,image/png

Policies necesarias

Solo una policy de lectura pública:

create policy "Public read users images"
on storage.objects
for select
using (bucket_id = 'users');


NO se crean policies de INSERT, UPDATE o DELETE, porque:

el backend usa SERVICE_ROLE_KEY

RLS se bypassa automáticamente

Variables de entorno (backend)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxx


La SERVICE_ROLE_KEY:

solo existe en backend

nunca se expone al frontend

se mantiene fuera del repositorio

Estructura de paths en Storage

Convención obligatoria:

users/
 └── {userId}/
      ├── products/
      │    └── {productId}.webp
      ├── profile/
      │    └── avatar.webp


Notas:

userId es el ID de tu tabla user

No depende de Supabase Auth

Es solo organización lógica

Servicio de Storage en el backend (ejemplo)
import { createClient } from '@supabase/supabase-js';

export class SupabaseStorageService {

  private supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  async uploadProductImage(
    userId: string,
    productId: string,
    file: Buffer
  ): Promise<string> {

    const path = `${userId}/products/${productId}.webp`;

    const { error } = await this.supabase.storage
      .from('users')
      .upload(path, file, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/users/${path}`;
  }
}

Uso desde un controller
@Post('products/:id/image')
@UseGuards(JwtAuthGuard)
async uploadProductImage(
  @User() user,
  @Param('id') productId: string,
  @UploadedFile() file: Express.Multer.File,
) {
  const imageUrl = await this.storageService.uploadProductImage(
    user.id,
    productId,
    file.buffer,
  );

  await this.productService.update(productId, {
    imageUrl,
  });

  return { imageUrl };
}

Qué se guarda en la base de datos

Ejemplo en products:

imageUrl: string; // URL pública de Supabase Storage


Nunca se guarda:

archivos

buffers

base64

paths locales

Implicaciones importantes

Migrar de servidor backend NO afecta imágenes

Se puede escalar el backend horizontalmente

Se mantiene intacto el sistema de roles/permisos

Se evita duplicar autenticación

Supabase Storage se usa como infraestructura, no como sistema de auth

Decisión final (para dejar asentado)

Autenticación: backend propio

Autorización: backend propio

Storage: Supabase Storage

Escritura en storage: solo backend

Frontend: nunca interactúa con Supabase

Esta es una arquitectura válida, profesional y usada en sistemas reales cuando ya existe un backend sólido con control de permisos.
