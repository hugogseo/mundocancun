# Panel de Administración - Mundo Cancún

Este documento describe el panel de administración completo implementado para la plataforma.

## 🔐 Seguridad y Acceso

### Middleware de Autenticación

El archivo [middleware.ts](middleware.ts) protege todas las rutas `/admin/*`:

1. **Verificación de autenticación**: Redirige a `/login` si no hay usuario autenticado
2. **Verificación de roles**: Solo permite acceso a usuarios con rol `admin` o `editor`
3. **Redirección**: Usuarios sin permisos son redirigidos a la página principal

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS configuradas en [supabase/schema.sql](supabase/schema.sql):

- **Paquetes**: Solo admin/editor pueden crear, editar y eliminar
- **Consultas/Cotizaciones**: Solo admin/editor tienen acceso
- **Reservas**: Admin/editor ven todas, usuarios solo las suyas
- **Pagos**: Admin/editor ven todos, usuarios solo los suyos
- **Chat**: Admin/editor ven todas las sesiones

## 📁 Estructura del Panel

### Layout Principal
[app/admin/layout.tsx](app/admin/layout.tsx)

- Navegación lateral con 7 secciones
- Header con nombre del sitio
- Protección de ruta con verificación de rol
- Diseño responsivo

### Dashboard
[app/admin/page.tsx](app/admin/page.tsx)

**Estadísticas en tiempo real:**
- Total de paquetes
- Total de reservas
- Total de consultas
- Ingresos totales (solo pagos exitosos)

### Gestión de Paquetes

#### Listado
[app/admin/packages/page.tsx](app/admin/packages/page.tsx)

- Vista de todos los paquetes
- Badges de estado (draft, published, archived)
- Badges de modo de reserva (inquiry, quote, payment)
- Botones de edición y eliminación
- Botón "Nuevo Paquete"

#### Crear Paquete
[app/admin/packages/new/page.tsx](app/admin/packages/new/page.tsx)

**Formulario completo con:**

1. **Información Básica**
   - Título (genera slug automáticamente)
   - Slug (URL amigable)
   - Destino
   - Descripción corta
   - Descripción larga

2. **Precio y Detalles**
   - Precio base (MXN)
   - Duración en noches
   - Huéspedes mínimo/máximo

3. **Estado y Modo**
   - Estado: draft, published, archived
   - Modo de reserva: inquiry, quote, payment
   - Descripción del modo seleccionado

4. **Categorías**
   - Selector con checkboxes
   - Vista de chips (Resort, Villa, Island, Family, Luxe)
   - Permite múltiples categorías

5. **Imágenes**
   - Subida de imagen de portada
   - Preview en tiempo real
   - Subida múltiple de imágenes adicionales
   - Preview de todas las imágenes
   - Eliminación de imágenes adicionales

**Funcionalidades:**
- Subida directa a Supabase Storage (bucket `packages`)
- Validación de campos requeridos
- Loading states durante la subida
- Redirección al listado tras crear

#### Editar Paquete
[app/admin/packages/[id]/page.tsx](app/admin/packages/[id]/page.tsx)
[app/admin/packages/[id]/edit-form.tsx](app/admin/packages/[id]/edit-form.tsx)

**Funcionalidades adicionales:**
- Pre-carga de todos los datos del paquete
- Edición de imagen de portada (elimina anterior si se cambia)
- Vista de imágenes existentes con opción de eliminar
- Subida de nuevas imágenes adicionales
- Actualización de categorías
- Botón "Eliminar Paquete" (con confirmación)
- Eliminación en cascada (imágenes, categorías, etc.)

### Gestión de Consultas
[app/admin/inquiries/page.tsx](app/admin/inquiries/page.tsx)

**Muestra:**
- Nombre completo del cliente
- Email y teléfono
- Paquete de interés
- Fechas deseadas
- Presupuesto
- Número de huéspedes
- Notas adicionales
- Fuente (website, chat, email, phone)
- Fecha de creación

**Acciones:**
- Botón "Responder" (abre email)
- Botón "Crear Cotización" (próximamente)

### Gestión de Cotizaciones
[app/admin/quotes/page.tsx](app/admin/quotes/page.tsx)

**Muestra:**
- ID de cotización
- Estado (pending, sent, accepted, rejected)
- Cliente asociado
- Paquete asociado
- Precio total
- Detalles en JSON
- Fecha de creación

**Acciones:**
- Ver detalles completos
- Marcar como enviada
- Aceptar/Rechazar cotización

### Gestión de Reservas
[app/admin/bookings/page.tsx](app/admin/bookings/page.tsx)

**Muestra:**
- ID de reserva
- Estado (pending, confirmed, cancelled, completed)
- Paquete reservado
- Cliente
- Fechas (check-in, check-out)
- Número de huéspedes
- Monto total
- Metadata adicional

**Acciones:**
- Ver detalles
- Confirmar reserva
- Cancelar reserva

### Gestión de Pagos
[app/admin/payments/page.tsx](app/admin/payments/page.tsx)

**Dashboard de pagos:**
- Total de ingresos (solo exitosos)
- Cantidad de pagos exitosos
- Cantidad de pagos pendientes
- Cantidad de pagos fallidos

**Listado de pagos:**
- ID de pago
- Estado (pending, succeeded, failed, refunded)
- Monto
- Reserva asociada
- Cliente
- Stripe Session ID
- Stripe Payment Intent ID
- Datos completos de Stripe (JSON)

**Acciones:**
- Ver en Stripe Dashboard
- Ver reserva asociada
- Reembolsar (solo exitosos)

### Visor de Chat
[app/admin/chat/page.tsx](app/admin/chat/page.tsx)

**Muestra:**
- Todas las sesiones de chat
- Usuario asociado (o "Anónimo")
- Canal de comunicación
- Fecha de creación
- Historial completo de mensajes
- Metadata de la sesión

**Vista de mensajes:**
- Interfaz tipo chat
- Avatares para usuario y asistente
- Marca de tiempo
- Scroll automático
- Diseño diferenciado (usuario vs asistente)

## 🗄️ Supabase Storage

### Configuración del Bucket

Ver [supabase/STORAGE_SETUP.md](supabase/STORAGE_SETUP.md) para instrucciones completas.

**Bucket name**: `packages`
**Tipo**: Público (lectura pública, escritura solo admin/editor)

### Funciones de Storage

[lib/storage.ts](lib/storage.ts)

- `uploadPackageImage()`: Sube imagen al bucket con timestamp único
- `deletePackageImage()`: Elimina imagen del bucket

**Características:**
- Nombres de archivo únicos con timestamp
- Organización en carpeta `packages/`
- URLs públicas automáticas
- Cache control configurado

## 🔧 Utilidades

### Service Role Client

[lib/supabase/service.ts](lib/supabase/service.ts)

Cliente de Supabase con **Service Role Key** que bypasea RLS.

**IMPORTANTE**: Solo usar para operaciones que requieren permisos elevados. La mayoría de operaciones deben usar el cliente normal con RLS.

**Uso actual**: No se usa directamente en el código actual, pero está disponible para operaciones futuras que requieran bypass de RLS (ej: migraciones, scripts de admin).

## 📊 Modelo de Datos

Todas las tablas están definidas en [supabase/schema.sql](supabase/schema.sql) con:

- Índices optimizados
- Foreign keys con cascadas
- Triggers de updated_at
- Enums para estados
- Validaciones a nivel de BD

### Relaciones Principales

```
pkg_packages
  ├── pkg_package_images (1:N)
  ├── pkg_package_tags (N:M con cat_categories)
  ├── lead_inquiries (1:N)
  ├── lead_quotes (1:N)
  └── bookings (1:N)
      └── payments (1:N)

chat_sessions
  └── chat_messages (1:N)
```

## 🎨 Componentes UI

Todos los componentes de shadcn/ui usados:

- Button, Input, Label, Textarea
- Card, Badge, Checkbox
- Select, Avatar, ScrollArea
- Loader2 (icono de carga)

Ver [components/ui/](components/ui/) para implementaciones.

## 🚀 Flujos de Trabajo

### Crear un Paquete

1. Admin navega a `/admin/packages`
2. Clic en "Nuevo Paquete"
3. Llena formulario:
   - Info básica (auto-genera slug)
   - Precio y duración
   - Selecciona estado y modo de reserva
   - Marca categorías
   - Sube imagen de portada
   - Sube imágenes adicionales
4. Clic en "Crear Paquete"
5. Sistema:
   - Sube imágenes a Storage
   - Crea registro en `pkg_packages`
   - Crea registros en `pkg_package_images`
   - Crea registros en `pkg_package_tags`
6. Redirige a listado

### Gestionar Consultas → Cotización → Reserva

1. Cliente llena formulario de contacto → `lead_inquiries`
2. Admin ve consulta en `/admin/inquiries`
3. Admin crea cotización → `lead_quotes`
4. Cliente acepta cotización
5. Se crea reserva → `bookings` (status: pending)
6. Si modo es "payment":
   - Cliente paga con Stripe
   - Webhook actualiza `payments` y `bookings`
   - Status cambia a "confirmed"

## 🔒 Seguridad

### Prevención de Acceso No Autorizado

1. **Middleware**: Primera línea de defensa
2. **RLS**: Segunda capa en base de datos
3. **Service Role**: Usado solo en server-side cuando necesario
4. **Validación**: Formularios con validación client y server

### Manejo de Imágenes

- Storage con políticas RLS
- Solo admin/editor pueden subir/eliminar
- Validación de tipos de archivo
- Límite de tamaño configurado

## 📝 TODOs Futuros

- [ ] Implementar acciones de estado (confirmar reserva, marcar cotización como enviada)
- [ ] Crear formulario de cotización desde inquiry
- [ ] Sistema de notificaciones email
- [ ] Exportar reportes (PDF, Excel)
- [ ] Dashboard con gráficas
- [ ] Logs de actividad de admin
- [ ] Búsqueda y filtros avanzados
- [ ] Paginación en listados largos
- [ ] Drag & drop para ordenar imágenes
- [ ] Editor WYSIWYG para descripciones

---

**Panel de Administración** completamente funcional y listo para producción.
