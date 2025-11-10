# Estructura del Proyecto Mundo Cancún

## 📁 Ubicación del Proyecto

```
c:\Hugo\MUndo Cancun\pagina dinamica\
```

Este es el directorio raíz del proyecto Next.js.

## 🗂️ Estructura de Carpetas

```
pagina dinamica/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Página principal (Hero con "Explore The World")
│   ├── layout.tsx                # Layout global (con ChatWidget y Toaster)
│   ├── admin/                    # Panel de administración
│   │   ├── packages/             # CRUD de paquetes
│   │   ├── bookings/             # Gestión de reservas
│   │   ├── payments/             # Gestión de pagos
│   │   ├── quotes/               # Gestión de cotizaciones
│   │   ├── inquiries/            # Gestión de consultas
│   │   └── chat/                 # Visor de chats
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Integración con N8N
│   │   ├── checkout/             # Checkout de Stripe
│   │   └── stripe/webhook/       # Webhooks de Stripe
│   ├── packages/                 # Catálogo de paquetes
│   ├── checkout/success/         # Página de confirmación
│   ├── contact/                  # Página de contacto
│   └── articles/                 # Blog/Artículos
│
├── components/                   # Componentes React
│   ├── ui/                       # Componentes de shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── toast.tsx
│   │   └── ... (más componentes)
│   ├── chat-widget.tsx           # Widget de chat flotante
│   ├── navbar.tsx                # Barra de navegación
│   ├── footer.tsx                # Pie de página
│   ├── package-card.tsx          # Tarjeta de paquete
│   ├── search-form.tsx           # Formulario de búsqueda
│   └── checkout-button.tsx       # Botón de checkout con modal
│
├── lib/                          # Utilidades y configuraciones
│   ├── supabase/
│   │   ├── client.ts             # Cliente de Supabase para cliente
│   │   ├── server.ts             # Cliente de Supabase para servidor
│   │   ├── service.ts            # Service Role client (bypass RLS)
│   │   └── middleware.ts         # Middleware de Supabase
│   ├── storage.ts                # Helper para Supabase Storage
│   └── utils.ts                  # Utilidades generales
│
├── supabase/                     # Configuración de Supabase
│   └── schema.sql                # Schema completo de la base de datos
│
├── types/                        # TypeScript types
│   └── database.types.ts         # Tipos generados de Supabase
│
├── hooks/                        # React hooks personalizados
│   └── use-toast.ts              # Hook para toast notifications
│
├── scripts/                      # Scripts de utilidad
│   └── seed.ts                   # Script para poblar la BD
│
├── middleware.ts                 # Next.js middleware (auth + roles)
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
├── tsconfig.json                 # Configuración de TypeScript
├── package.json                  # Dependencias del proyecto
│
├── .env.local                    # Variables de entorno (NO COMMITEAR)
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore                    # Archivos ignorados por Git
│
└── Documentación/
    ├── README_PROYECTO.md        # Documentación general
    ├── ADMIN_PANEL.md            # Documentación del panel admin
    ├── CHECKOUT_FLOW.md          # Flujo de checkout y pagos
    └── CHAT_WIDGET.md            # Documentación del chat widget
```

## ⚠️ IMPORTANTE: Carpeta Duplicada

Existe una carpeta `mundocancun/` dentro de `pagina dinamica/` que debe ser **ELIMINADA MANUALMENTE**:

```bash
# Cierra tu IDE/editor primero
cd "c:\Hugo\MUndo Cancun\pagina dinamica"
rm -rf mundocancun
```

Esta carpeta está vacía y es un residuo de la instalación inicial. Si no puedes eliminarla porque está en uso, cierra todas las aplicaciones que puedan estar accediendo a ella.

## 🚀 Comandos Principales

```bash
# Ubicarse en el directorio del proyecto
cd "c:\Hugo\MUndo Cancun\pagina dinamica"

# Instalar dependencias
npm install --legacy-peer-deps

# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Lint
npm run lint

# Type check
npm run typecheck
```

## 📝 Variables de Entorno

Copia `.env.example` a `.env.local` y configura las variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# N8N
N8N_CHAT_WEBHOOK_URL=https://tu-n8n.com/webhook/chat

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe (MXN)
- **Chat**: N8N Webhook Integration
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Tipografía**: Inter + Playfair Display

## 📦 Características Implementadas

✅ Landing page pixel-perfect con "Explore The World"
✅ Sistema de paquetes con categorías
✅ Panel de administración completo (CRUD)
✅ Integración con Stripe para pagos en MXN
✅ Sistema de reservas (inquiry/quote/payment)
✅ Chat widget con integración N8N
✅ Supabase Storage para imágenes
✅ Row Level Security (RLS)
✅ Middleware de autenticación y roles
✅ Diseño responsive (md/lg/xl breakpoints)
✅ Componentes con rounded-2xl y sombras suaves

## 🔐 Acceso al Panel de Administración

El panel de administración está protegido y solo es accesible para usuarios con rol `admin` o `editor`.

Ruta: `/admin`

## 📚 Documentación Adicional

- Ver `README_PROYECTO.md` para guía general del proyecto
- Ver `ADMIN_PANEL.md` para documentación del panel de administración
- Ver `CHECKOUT_FLOW.md` para detalles del flujo de checkout
- Ver `CHAT_WIDGET.md` para documentación del widget de chat
